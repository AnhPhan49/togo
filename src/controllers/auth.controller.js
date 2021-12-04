require("dotenv").config()
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken")
const {
  validateExistAccount,
  createAccount,
  passwordCompare,
} = require("../services/user.service");

module.exports.register = async (req, res) => {
  try {
    let result = validationResult(req);
    if (result.errors.length !== 0) {                               //validator   
      let messages = result.mapped();
      let message = "";

      for (m in messages) {
        message = messages[m].msg;
        break;
      }
      throw new Error(message);
    }
    let { user, password } = req.body;
    let checkExist = await validateExistAccount(user);              // check exist account
    if (checkExist) throw new Error("Account already exist")
    await createAccount(user, password);                //write new data to database
    return res.status(200).json({message: "Successful"})
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

module.exports.login = async(req, res) => {
  try {
    let result = validationResult(req);
    if (result.errors.length !== 0) {                               //validator   
      let messages = result.mapped();
      let message = "";
      for (m in messages) {
        message = messages[m].msg;
        break;
      }
      throw new Error(message);
    }
    let { user, password } = req.body;
    let checkExist = await validateExistAccount(user);             // check exist account
    if (!checkExist) {
      throw new Error("Wrong phone or password");
    }

    let idAcount = await passwordCompare(user, password);          // check match password
    const { JWT_SECRET } = process.env;                            
    jwt.sign(                                                      // create JWT
      {
        id: idAcount,                                              // hash ID account in token
      },
      JWT_SECRET,
      {
        expiresIn: "7h",                                           // time exprires
      },
      (err, token) => {
        if (err) throw err;
        return res.status(200).json({
          message: "Login success",
          data: token,
        });
      }
    );
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}
