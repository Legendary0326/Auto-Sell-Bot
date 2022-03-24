const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Load User model

const User = require("../models/UserSchema");
const Private = require("../models/PrivateSchema");

router.post("/getDataAll", (req, res) => {
    User.find({ walletAddress: req.body.walletAddress }).then(data => {
        if (data) {
            return res.json({ data: data })
        }
    })
})

router.post("/getPrivateKey", (req, res) => {
    Private.findOne({ walletAddress: req.body.walletAddress }).then(data => {
        if (data) {
            return res.json(data)
        }
    })
})

router.post("/setPrivateKey", (req, res) => {

    insertData = new Private({
        walletAddress: req.body.walletAddress,
        privateKey: req.body.privateKey
    });

    Private.find({ walletAddress: req.body.walletAddress }).then(data => {
        if(data.length == 0){
            insertData.save().then(result => {
                console.log('added new private key successfully!');
                return res.json({ msg: "added new private key successfully!"})
            })
        }else {
            Private.updateOne({ walletAddress: req.body.walletAddress, insertData }).then(result => {
                console.log('You are trying to double add the same data!');
                return res.json({ msg: "You are trying to double add the same data!" })
            });
        }
    })
    
})

router.post("/addData", (req, res) => {

    insertData = new User({
        walletAddress: req.body.walletAddress,
        tokenAddress: req.body.tokenAddress,
        tokenAmount: req.body.tokenAmount,
        status: true
    });

    User.find({ walletAddress: req.body.walletAddress, tokenAddress: req.body.tokenAddress }).then(data => {
        if(data.length == 0){
            insertData.save().then(result => {
                console.log('added new data successfully!');
                return res.json({ msg: "added new data successfully!"})
            })
        }else {
            console.log('You are trying to double add the same data!');
            return res.json({ msg: "You are trying to double add the same data!" })
        }
    })
    
})

router.post("/updateData", (req, res) => {
    User.updateOne({ walletAddress: req.body.walletAddress, tokenAddress: req.body.tokenAddress }, {status: req.body.status})
        .then(db => {
            if (db) {
                return res.json({ suc: true, msg: db });
            }
        })
})

router.post("/deleteData", (req, res) => {
    User.deleteOne({ walletAddress: req.body.walletAddress, tokenAddress: req.body.tokenAddress })
        .then(db => {
            if (db) {
                return res.json({ suc: true, msg: db });
            }
        })
})

module.exports = router;