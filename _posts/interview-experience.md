---
title: 'An interview experience'
date: '2024-07-30T15:12:58.010Z'
---
_Edited on 16 Aug 2024_
## Interviews...
I've read some posts about going for interviews that seem tough - "Don't judge yourself before going for an interview,
let the interviewer do that for you". Heck, I thought, why not give it a shot. Since I'm currently a Senior Software Developer,
I shall try applying for Senior roles.

I had a Senior Software Developer interview, and I was really humbled by the experience.

_This is a mini retrospective and will probably be quite wordy. You've been warned._

A few questions that really stood out:

**What is the most challenging project I've worked on in my current role?**

I was quite stumped by this, and had to think for a while. Eventually, I came up with the answer of working on making sure that
the application was secure, in the sense that no plain-text private keys were stored, or being passed around over the network.
Although this is very important in the context of a Wallet-as-a-Service application, the solution of making sure that the private
key is encrypted, in-transit and at-rest, is not a very complex one. If that sounds unimpressive, the interviewer was not impressed either.

I've realised that the key to answering such questions is to really think about _what_ I've done and accomplished at my time in Levain.
I've worked on a lot of things - big and small - but I've never really thought about what was the most challenging. If asked again,
I'd probably talk about dealing with the implementation of _asynchronously collecting M transaction signatures for a multi-signature wallet with
N owners and still dealing with a monotonically increasing nonce_. That's a mouthful, isn't it?


**What makes Redis fast?**

"Redis is fast because it's an in-memory store" was my answer. I was asked to explain further, and I couldn't come up with an answer.
I've used Redis, but I've never had to think about why it's fast. I've always taken it for granted that it's fast, and I'm pretty
sure most developers do. To be fair, you might think that this is just a trivia question, but IMO it's not. It shows
experience and understanding of the tools you use or the domain you are in - something that I clearly lack regarding Redis.

As an example, I could ask a question of 'How do we ensure that Ethereum transaction nonces are unique for multi-signature
wallet transactions where different owners are signing the same transaction asynchronously?'. Not many people can answer something like that (I think)
but again, it shows _experience_ in that domain.

To be fair - the JD _specifically_ asks for strong knowledge of different tools like Redis/Kafka etc. So I won't blame the interviewer
for this.

Moving forward, I'll need to start reading `Designing Data Intensive Applications` to better understand more of such concepts on a
general level, and I'll need to read up more about different tools whenever I see them in a JD.

## What's next?
I actually had a few interviews lined up with similar requirements in the JD as compared to the interview I'm talking about,
and I cancelled them. I'm obviously not ready for such interviews, and I don't want to waste the interviewer's (or my) time.

I'll obviously need to start buffing up my knowledge, but IMO it's not as simple as that. Practical experience trumps theoretical
knowledge.

To be honest, I dislike interviews, especially those that seem like trivia sessions or programming challenges.
I'd much rather participate in some system design, code out a technical assessment,
or even pair-program with the interviewer. I think that would be a much better way to gauge a candidate's
skill. Unfortunately, this is the way the industry works, and that's all there is to say about it.

It's time to put my ego aside and also apply for more junior roles, even though there will most definitely be a pay cut. I do understand
that what a 'Senior' engineer is in one company might be a 'Junior' engineer in another. I'll need to keep that in mind too.

In my head, as long as I can learn and further myself even more - carve a niche for myself - I'll be happy. Does it need to be
in Web3/Crypto space? Not necessarily. I'm open to almost anything at this point. As long as I feel that it's a good fit for me, and that
I'll be taking away something concrete from the role, I'm game.


