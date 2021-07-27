const express = require('express');
const app = express();
const questions = require ('./questions.json');

app.get('/questions', (req,res) => {
    res.status(200).json(questions);
});

app.listen(8080, () => {
    console.log("Server Listening");
});