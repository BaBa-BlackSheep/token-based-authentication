const express = require("express");
const hostname = "tokenserver";
const port = 4000;
const jwt = require("jsonwebtoken");
const app = express({ hostname: hostname });

app.use(express.json());

app.listen(port, () => {
    console.log(`auth-server running at http://${hostname}:${port}/`);
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username === "admin" && password === "admin") {
        res.status(404).send({ msg: "creds not valid" });
    }
    const REFRESH_TOKEN = jwt.sign(
        { username: username },
        process.env.LONG_KEY
    );
    const ACCESS_TOKEN = jwt.sign(
        { username: username },
        process.env.SHORT_KEY,
        { expiresIn: "55s" }
    );
    res.send({
        accessToken: ACCESS_TOKEN,
        refreshToken: REFRESH_TOKEN,
    });
});

app.post("/token", (req, res) => {
    const refreshToken = req.body.refreshToken;
    let user = null;
    jwt.verify(refreshToken, process.env.LONG_KEY, (err, u) => {
        if (err) return res.status(401).send({ msg: err });
        user = u;
    });
    const newAccessToken = jwt.sign(
        { username: user.username },
        process.env.SHORT_KEY,
        {
            expiresIn: "55s",
        }
    );
    console.log(`new acess token for 55s : ${newAccessToken}`);
    res.send({ accessToken: newAccessToken });
});

app.post("/authenticate", (req, res) => {
    console.log("app-server received req : ", req.body);
    // const authHeader = req.headers["authorization"];
    // console.log(`auth hearer : ${authHeader}`);
    const token = req.body["accessToken"].split(" ")[1]; //authHeader && authHeader.split(" ")[1];
    if (token === null) {
        return res.status(401).send({ msg: "token is required" });
    }
    jwt.verify(token, process.env.SHORT_KEY, (err, u) => {
        if (err) {
            return res.status(200).send({ isAuthenticated: false, msg: err });
        }
        return res.status(200).send({ isAuthenticated: true, user: u });
    });
});

app.get("/ping", (req, res) => res.send({ msg: "hello" }));
