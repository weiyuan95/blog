---
title: 'Designing a URL Shortener'
date: '2024-10-08T10:31:51.091Z'
---

## Introduction
Recently, I had to undergo an assessment to design and implement a URL shortening service, similar
to what you'd use at [tinyurl](https://tinyurl.com/).

Here were the requirements:
1. Given any valid URL, generate a short URL (within 8 characters) to uniquely identify it
   - Having a unique string would allow us to identify the corresponding URL to redirect the user to
   - We can generate _multiple_ short URLs to identify _the same_ URL. This essentially means that a URL can be shortened
   multiple times, with different short URLs each time
   - We should be able to store _a lot_ of short URLs
   - The short URLs should be URL safe
2. Retrieve the `<title>` tag of the page as additional metadata for the user
3. Store analytics that tracks visits to each shortened URL

Let's break it down.

## How exactly do we shorten a URL?
### Monotonically increasing ID
We just need to uniquely identify a particular 'short' string to a given URL. This shortened string _must be 
unique_. If it isn't, then we could have a collision (ie. the same 'short' string points to
different URLs) - we wouldn't know where to redirect the user.

The simplest (I'll admit, this actually took me awhile to realise) possible solution is to use an auto-incrementing
integer. Our short urls would look like `https://domain.com/1`, `https://domain.com/2`, `https://domain.com/2147483648`, etc.
This integer could come from the primary key of a database table. The RDMS itself ensures that primary keys are unique.
Although simple, there are a few downsides to this solution.
- The biggest downside here is the length of the short URL. The more short URLs we store, the longer that string gets
- The database itself can be a bottleneck, since the `INSERT` must complete before an ID is generated and then
returned to the user. When it comes to scaling writes, multi-write setups are not feasible since we can't
have eventual consistency for the ID - it has to be accurate. We'll need to explore other methods to scale writes
- There is a potential vulnerability where a user can easily iterate through all possible numbers from `1..n`
and ‘scan’ all the URLs in our database just by increasing the number

For the first downside, we can `base62` encode the ID to shorten it (going from `base10` -> `base62` shortens the string)
however, it still leaves us with the other problems - we're locked into relying on our database for an ID, and our 
implementation must be strictly consistent.

### Hashing
This was the first idea that came to my mind. We have a short URL that identifies a long URL - that's very similar to
a hash table. Naively, we could just hash the long string, take the first 8 characters of that hash, and that hash will
now identify that long URL. However, there's a huge problem: hash collisions. If we only take the first 8 characters,
that means we can only store 16 ** 8 short URLs. Even if we did control the output format and used something like `base62`,
the even bigger problem is that a long URL always generates the same hash.

In order for a longer URL to generate a different hash each time it is hashed, we'll need to salt it with a sufficiently random value (eg. a UUID)
for improved collision resistance, which allows us to have different hashes identifying the same long URL.

Keep in mind that this solution allows us to generate a short URL without the need to rely on any external service.

### My solution
I ended up using a variation of the hashing solution, because I felt that being locked into using a database to generate
IDs is a solution that does not really scale well (relatively, of course, but we'll get to that). My algorithm ended up
following this pseudocode:
1. Generate a UUIDv4 as a random salt
2. Prepend it to the front of a `long_url`
3. `hash_url = hash(#{salt}#{long_url})`
   - Although this is technically not necessary since we can just hash the salt, including the `long_url` adds more randomness
4. If `hash_url[0..10]` exists, re-hash with a different `salt`
5. If it does not exist, convert `hash_url[0..10]` to its decimal value, and base62 encode that value. This is now a unique `hashed_url`.
   - We wouldn't need this step if our hashing algorithm returns a hash in base62

This solution:
- Allows us to have _a lot_ of short URLs. Assuming that the hash is in hex, we can represent 16 ** 11 unique hashes -
that's a lot of hashes!
- The algorithm itself isn't dependent on any external factors. We only need to persist it somewhere to store that mapping
of short URL to long URL. This allows us some leeway in how we want to architect our shortening service, 
since we're not tightly coupled to some external service to generate the short URL

### A side note
After having a discussion, an idea was floated about using 8 random `base62` characters to create an 8 character long string.
Again, it's another possibility that I didn't think about, but seems obvious in hindsight. This is why I really enjoy this
profession BTW - there are so many valid ways to approach problems, and it's usually about tradeoffs at the end of the day.

Back to the topic: how does using a random 8 character string compare to my solution above? Speed-wise, a lot faster, since
we don't need to have the overhead of using algorithms like SHA-256, hex to decimal conversion, etc. Benchmarking a million
runs show that randomly selecting 8 characters is ~3 times faster than my proposed solution! There's a caveat though -
I'm using Ruby's builtin `Array.sample` for the random character selection, and I'm also not checking for collisions in my benchmarks.

Honestly, it's a great idea. If we're not worried about _how_ (cryptographically) random our strings are, it's even better.

If anything, this has really shown me that it's really important to have some kind of RFC or discussion before committing to
an idea. Multiple heads are always better than one, and different viewpoints always helps. 

### Scaling
How well does this solution scale? Our URL shortener does not need to be strictly consistent anymore, since the generation
of the short URL does not depend on the database and its incremented ID. This allows us to be more available at the sake of consistency.
There are a few ways to speed up the application, starting from the least drastic:
- Provision multiple read replicas with something like AWS RDS. Since a single short URL can be shared, in turn causing 
many reads on the underlying long URL, the read load will generally be higher than the write load. It makes sense to have 
a few read replicas in that scenario
   - Keep in mind that we still need to check the database to prevent hash collisions. In the event that there is a hash collision
  on data that has not been replicated, there is a possibility that the final write might have a collision. We can prevent
  this with a unique index on the short URL to prevent this (frankly, rare) scenario from happening. The RDBMS will
  prevent any bad inserts in the event of a collision
- Use Redis as the primary store for our short URLs, instead of writing to a database. Updating the database can come later, either as a job, or doing some
kind of batch syncing from Redis. The application primarily reads/writes to Redis, with a RDBMS as a persistence layer. We leverage on
the speed of Redis here, using the RDBMS only for persistent storage. To solve the problem of O(N) `EXISTS` calls on Redis,
we can also use a bloom filter for a time and space efficient way to check that a short URL _does not_ exist
  - This might be an oversimplification, depending on the data that needs to be stored
  - Redis was not designed to be a persistent store - its durability is not per-transaction (unless you configure it
  to be so). If it's allowable (from a business POV) to have links that might not work, then this is not a problem. If the
  trade-off is unacceptable, then using Redis primarily as a cache would be best to take some load off the database

## Retrieving the `<title>`
Compared to shortening a URL, this is way more straightforward. Whenever we shorten a URL, we just `curl` the page and
pass the HTML to a HTML parser, which we can then extract the `<title>` from. The hard part about this is that it there
is some overhead in making an HTTP request to the page and then parsing it. If we expect the titles to never change, we can actually use
Redis to cache the title of pages. This should only be something that is done if we expect lots of cache hits though -
if there's a lot of cache misses, then we are making an additional call to Redis for no good reason. This is a decision
that should be made only after gathering some usage data.

Another thing to take note of is _why_ we are retrieving the title. If we don't need to show
it to a user, we can also throw this to a job so that it doesn't block the call to shorten a URL.

## Analytics data?!
I've never really touched OLAP (OnLine Analytical Processing, if you didn't know. Its counterpart is OLTP or OnLine Transaction Processing)
in my career, so this was definitely a new domain for me.

OLAP queries should never come in the way of queries that are necessary for business logic,
for the simple fact that those queries are not important for the business. There are some ways we can get around this
if we want to store data for analytics:
- Provision another database (ie. data warehouse) for analytics data. Run ETL pipelines to ensure that the data warehouse
is as up to date as possible. Query for analytics data should only hit this data warehouse
- Analytics should never affect latency. If necessary, pass it off to a job to update the database
- Read replicas would be helpful to take load off the database when extracting large amounts of data for ETL pipelines.
If necessary, we can have a replica that only serves the ETL pipeline if it's having a negative impact on latency

## Conclusion
That's it! It was a great mental (and coding) challenge to implement a URL shortener. I'd probably keep the service
up after removing or feature flagging some aspects of the application. Just to flex to people that I have a deployed
URL shortener.