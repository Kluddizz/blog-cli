#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const argparse = require("argparse");
const matter = require("gray-matter");
const reader = require("readline-sync");

const requestToken = async () => {
  const username = reader.question("Username: ");
  const password = reader.question("Password: ", { hideEchoBack: true });

  const request = await fetch(`http://localhost:5003/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  });

  return await request.json();
};

const postCommand = async (args) => {
  const fileContent = fs.readFileSync(args.file, { encoding: "utf-8" });
  const { data, content } = matter(fileContent);

  const request = await fetch(`${args.host}/post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, content }),
  });

  const response = await request.json();
  console.log(response.message);
};

const deleteCommand = (args) => {};

const updateCommand = async (args) => {
  const response = await requestToken();

  if (response.status === 200) {
    const fileContent = fs.readFileSync(args.file, { encoding: "utf-8" });
    const { data, content } = matter(fileContent);

    const req = await fetch(`${args.host}/post/${args.slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${response.token}`,
      },
      body: JSON.stringify({ ...data, content }),
    });

    const res = await request.json();
    console.log(res.message);
  } else {
    console.log("Wrong credentials");
  }
};

const parser = new argparse.ArgumentParser();
const subparsers = parser.add_subparsers();

const postParser = subparsers.add_parser("post", { help: "create a post" });
postParser.add_argument("file");
postParser.add_argument("host");
postParser.set_defaults({ func: postCommand });

const deleteParser = subparsers.add_parser("delete", { help: "delete a post" });
deleteParser.add_argument("slug");
deleteParser.add_argument("host");
deleteParser.set_defaults({ func: deleteCommand });

const updateParser = subparsers.add_parser("update", { help: "update a post" });
updateParser.add_argument("file");
updateParser.add_argument("host");
updateParser.add_argument("slug");
updateParser.set_defaults({ func: updateCommand });

const args = parser.parse_args();
args.func(args);
