#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const argparse = require("argparse");
const matter = require("gray-matter");

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

const args = parser.parse_args();
args.func(args);
