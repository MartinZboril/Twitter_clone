import test from "ava"
import db from "../src/db.js"

test.beforeEach(async () => {
    await db.migrate.latest()
})

test.afterEach(async () => {
    await db.migrate.rollback()
})

// Unit tests

// Super tests

// TODO: create tweet

// TODO: tweet list

// TODO: tweet detail

// TODO: update tweet

// TODO: delete tweet