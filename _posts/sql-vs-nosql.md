---
title: 'Comparing read performance between different database types'
date: '2024-07-09T11:44:01.322Z'
---

## Preface
As part of recent efforts to learn more about databases, I've been trying to wrap my head around
the different scenarios of when and when not to use relation or non-relational (document based - Mongo,
Cassandra, DynamoDB) data stores.

Without thinking too much about horizontally scaling the databases (that's another can of worms),
I had a very naive questions about comparing the two different database types.

- What is the `read` performance?

We're not concerned about:
- Horizontally scaling, so no sharding, replication, etc.
- Referential integrity, ACID, or the inherent benefits that a SQL database would provide

Basically: If we were _only_ concerned about how fast a read is from the database, how long would it take?

Using Python, we're able to run some very simple tests.

## PostgreSQL
1. Set up our relational schema
```python showLineNumbers
cursor.execute(
"""
CREATE TABLE LOCATIONS ( 
    location_id BIGSERIAL PRIMARY KEY,
     area TEXT
);
CREATE TABLE USERS ( 
    user_id BIGSERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    location_id BIGINT REFERENCES LOCATIONS(location_id)
);
CREATE TABLE ORDERS ( 
    order_id BIGSERIAL PRIMARY KEY,
    amount INTEGER,
    user_id BIGINT REFERENCES USERS(user_id),
    description TEXT
);
"""
```

2. Inserting `100_000` locations, `1_000_000` users, and `1_000_000` orders
```python showLineNumbers
NUM_LOCATIONS = 100_000
location_values = [('Foo',) for _ in range(NUM_LOCATIONS)]
cursor.executemany(
    f"INSERT INTO LOCATIONS (area) VALUES (%s);"
    , location_values
)

NUM_USERS = 1_000_000
users_values = [
    ('Foo', 'Foo', random.randint(1, NUM_LOCATIONS))
        for _ in range(NUM_USERS)
]
cursor.executemany(
    f"INSERT INTO USERS (first_name, last_name, location_id) VALUES (%s, %s, %s)",
    users_values
)

NUM_ORDERS = 1_000_000
orders_values = [
    (10_000, random.randint(1, NUM_USERS), 'Foo')
        for _ in range(NUM_ORDERS)
]
cursor.executemany(
    f"INSERT INTO ORDERS (amount, user_id, description) VALUES (%s, %s, %s)",
    orders_values
)
```
3. Running our queries

We are joining all 3 tables since we want to mimic some realistic workloads
```python showLineNumbers
cursor.execute(
    """
    SELECT * FROM
    ORDERS JOIN USERS using (user_id)
    JOIN LOCATIONS using (location_id)
    WHERE location_id = 50000
    """
)

```
Our code above takes `0.05799816595390439` seconds to run. Decently fast, considering it's
an indexed lookup involving a primary key.

What about a non-indexed lookup?

```python showLineNumbers
cursor.execute(
    """
    SELECT * FROM
    ORDERS JOIN USERS using (user_id)
    JOIN LOCATIONS using (location_id)
    WHERE area = 'Foo'
    """
)
```
Now, this takes `0.9050237080082297` seconds to run. A lot slower, but it shows off the power of indexes
in the previous example.

```python showLineNumbers
cursor.execute(
    """
    SELECT * FROM
    ORDERS JOIN USERS using (user_id)
    JOIN LOCATIONS using (location_id)
    """
)
```
If we want to pull out all the rows for some crazy reason, it'll take `1.3498550418298692` seconds to run.

## MongoDB
For Mongo, we're keeping to the same data, except that we don't have a relational schema now.

1. Insert data into collection
```python showLineNumbers
NUM_ROWS = 1_000_000
data = [
    {
        'locations_id': i,
        'area': random.choice(random_words),
        'user_id': i,
        'first_name': 'Foo',
        'last_name': 'Foo',
        'order_id': i,
        'amount': 10_000,
        'description': 'Foo'
    } for i in range(1, NUM_ROWS + 1)
]

collection.insert_many(data)
```

2. Run our queries
```python showLineNumbers
collection.find({'location_id': 500_000})
```
Searching by a monotonic id is _really_ fast. `0.000050459057092666626` seconds.

```python showLineNumbers
collection.find({'area': 'Foo'})
```

Searching by a categorical field is _even faster_. `0.000014375196769833565` seconds!

## Conclusion
In this very naive comparison, we can see that for very simple `read` operations, Mongo is _much_ faster than PostgreSQL.
Even when timing the `write` operations, Mongo still comes out ahead.

This is not to say that Mongo is always better than Postgres or a SQL database - the tradeoff is
losing the benefits of a relational database, such as referential integrity, or ACID compliance.
Postgres also has a JSONB datatype, which allows for some of the flexibility that Mongo provides
when handling non-relational data.

This gave me a better understanding of the tradeoffs between the two types of databases - if we are running
an application at an incredible scale, with _very very_ high read/write operations per second on the database, we
might not care about the relational integrity of the data, and would prefer the speed of a document-oriented
database instead.

I would love to work on such a system in the future, and come back with practical experience and opinions on the matter.
