const Wallet = require("../models/wallet");
const User   = require("../models/user");
const busTicket = require("../models/busTicket");
const cors  = require('cors');
const https = require('https');
const dotenv  = require("dotenv")

dotenv.config();

exports.getWalletBalance = async (req, res) => {
    try {
      const wallet = await Wallet.findOne({ user: req.user.id });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }
      res.json({ balance: wallet.balance });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  //get route to topup wallet
  
exports.topup = async (req, res, next) => {
  try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
          return res.status(404).send("User not found");
      }

      res.render("topup.ejs", { user: user });
      console.log(user); // Log the user, not User
  } catch (err) {
      console.log(err);
      next(err); // Pass the error to the error handling middleware
  }
};


exports.topUpWallet = async (req, res) => {
  const { firstName, lastName, number, email, amount } = req.body;

  // Prepare the Paystack API request parameters
  const params = JSON.stringify({
    email: email,
    amount: amount *100, // Convert amount to naira
    metadata: {
      firstName: firstName,
      lastName: lastName,
      number: number
    }
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: 'Bearer sk_test_25e18a488bf2ced3ca24bc41f586197608b76d32',
      'Content-Type': 'application/json'
    }
  };

  // Make the Paystack API request
  const reqPaystack = https.request(options, resPaystack => {
    let data = '';

    resPaystack.on('data', chunk => {
      data += chunk;
    });

    resPaystack.on('end', async () => {
     
      const responseData = JSON.parse(data);
      
      res.redirect(responseData.data.authorization_url);
      console.log(JSON.parse(data))
      
        // Check if payment was successful and contains the authorization URL
      try {
        
          // Find the user by ID
          const user = await User.findById(req.params.id);

          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          // Find the wallet associated with the user
          const wallet = await Wallet.findOne({ user: user._id });

          if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
          }

          // Update the balance of the wallet
          wallet.balance + amount;

          // Save the updated wallet
          await wallet.save();
          
          // Redirect the user to the authorization URL
          console.log({ balance: wallet.balance });
      
      }
      
      catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  }).on('error', error => {
    console.error(error);
    res.status(500).json({ message: 'Error processing payment' });
  });

  // Send the request body to the Paystack API
  reqPaystack.write(params);
  reqPaystack.end();
};
