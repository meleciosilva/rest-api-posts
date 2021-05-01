const express = require("express");
const app = express();
const posts = require("./../data/posts.json");
const fs = require("fs");

app.use(express.json()); // gives you ability to send raw json data to API and expect it to be in request body
app.use(express.urlencoded()); // can now send url encoded bodies to API

// validation middleware

function postExists(req, res, next) {
  const { postId } = req.params;
  let foundPost = posts.find(post => Number(post.id) === Number(postId));
  if (foundPost) {
    return next();
  }
  return next({
    status: 404,
    message: `Post ID not found: ${postId}`
  })
}

// app-level middleware

app.get("/posts", (req, res) => {
  return res.json({ data: posts });
});

app.post("/posts", (req, res, next) => {
  const { title, body } = req.body.data;
  if (!title || !body) return next({ status: 500, message: "Both title and body are required" });
  const newPost = {
    userId: Math.ceil(Math.random() * 10),
    id: posts.length + 1,
    title,
    body
  }
  posts.push(newPost);

  let stringedData = JSON.stringify(posts, null, 2);
  fs.writeFile("data/posts.json", stringedData, (err) => {
    if (err) {
      return next({
        status: 500,
        message: err
      })
    }
  })

  return res.status(201).json({ message: "New Post Created!" })
})

app.get("/posts/:postId", postExists, (req, res) => {
  const id = req.params.postId;
  const foundPost = posts.find(post => Number(post.id) === Number(id));
  res.status(200).json({ data: foundPost });
})

app.put("/posts/:postId", postExists, (req, res) => {
  const id = req.params.postId;
  let foundPost = posts.find(post => Number(post.id) === Number(id));
  const { title = foundPost.title, body = foundPost.body } = req.body.data;
  foundPost.title = title;
  foundPost.body = body;
  
  let stringedData = JSON.stringify(posts, null, 2);
  fs.writeFile("data/posts.json", stringedData, (err) => {
    if (err) {
      return next({
        status: 500,
        message: err
      })
    }
  })

  return res.status(200).json({ data: foundPost })
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  const { status = 500, message = "Something went wrong!" } = error;
  res.status(status).json({ error: message });
});

module.exports = app;