---
title: 'Working on MoneyTracker'
date: '2024-08-18T13:15:33.141Z'
---
## Initial ideation
Before writing out any code, the first thing I did was to write down the features that I wanted in MoneyTracker.
I wanted to keep it simple first - and leave any 'advanced' features for later. To start, I thought, let's just
write a simple app that is purely client-side. It's main objective would be to track assets, and show the total
net-worth in a single currency. To be 100% honest, I thought I would be able to finish it within a week, while
also juggling my full time job.

I was wrong.

## Initial work
One big consideration I had was to decide if I wanted to use a component library, or hand roll my own styles
with Tailwind. I decided to go with the former since I wanted to focus on the functionality of the app, rather
than the design/style of the individual components.

The next thought I had was _where_ to store the data. I ended up using the browser's localStorage, and to be honest that
was the only possibility without an external database. Since writing Moneytracker was also an exercise to test my front-end/React
skills, I opted to implement my own wrapper around localStorage. My first iteration involved
writing a React hook like `useLocalStorage`, but I realised I didn't need it to be so generic, so I decided to just write my own
React Provider which would provide the localStorage to the entire app in an abstracted way.

## Reactivity is a pain
I'll be honest, most of the time (almost 2 weeks?) that went into developing MoneyTracker was spent on making sure that there were no bugs
with using localStorage. For example, I could update/add a Holding Entity to the store, and the component wouldn't re-render.
Or I would make an update (triggering a re-render), but the data wouldn't be updated in the localStorage. When the page is refreshed, the changes
are gone.

What I realised was that it was easier to keep all the reactive code in a single place (the Provider) instead of trying to access the Localstorage
from different components. This way, there is a single component that controls and triggers any reaction that comes
from the Holding Entities being mutated, instead of it being spread across multiple different components.

It's definitely not an ideal solution.

## How would I do it differently?
1. If the goal is to keep it a client-side only application, I would use a library that manages localStorage instead of trying to re-invent the wheel.
The component library that I used ([Mantine](https://github.com/mantinedev/mantine)) actually does have a `useLocalStorage` hook, but I didn't want to use it because I wanted to learn how to write my own.
2. Server-side rendering along with a backend that stores the data in a database. This would make it easier
since the data needed to render the page would already be available when the page loads. Obviously more complex, but I wouldn't
have to write and handle so many `isLoading` states for the different components in the hierarchy
that need to wait for the data to be fetched from the localStorage.

## What's next?
The goal is to make Moneytracker very similar to a portfolio application that lets you see the performance of not only your Crypto assets,
but your fiat assets as well. If it makes sense, I'd also add other financial instruments like stocks/options to it, although that is more
of an unknown for me. It's definitely require a backend, making it a pretty big re-write, but I think it'd be a fun little project.
