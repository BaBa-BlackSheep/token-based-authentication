const express = require("express");
const axios = require("axios");
const hostname = "app-server";
const port = 3000;
const app = express({ hostname: hostname });

app.use(express.json());

app.listen(port, () => {
    console.log(`server1 running at http://${hostname}:${port}/`);
});

app.get("/posts", authenticateToken, (req, res, next) => {
    return res.status(200).send({ msg: res.user });
});

function authenticateToken(req, res, next) {
    axios
        .post("http://localhost:4000/authenticate", {
            accessToken: req.headers["authorization"],
        })
        .then((r) => {
            if (r.data["isAuthenticated"]) {
                res.user = r.data["user"];
                next();
            }
            res.status(403).send({ msg: r.data["msg"] });
        })
        .catch((e) => console.error(`some error occured : ${e}, ${e.data}`));
}
