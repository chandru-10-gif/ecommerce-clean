const express = require("express");
const router = express.Router();


router.post("/api/register", async (req, res) => {


  const {
    name,
    phone,
    address,
    email,
    password
  } = req.body;

  const trimmedName = name?.trim();
  const trimmedPhone = phone?.trim();
  const trimmedAddress = address?.trim();
  const trimmedEmail = email?.trim();
  const trimmedPassword = password?.trim();

  if (!trimmedName || !trimmedPhone || !trimmedAddress || !trimmedEmail || !trimmedPassword) {
    return res.status(400).json({ error: "Please fill all required fields" });
  }

  if (!/^[A-Za-z\s]{2,}$/.test(trimmedName)) {
    return res.status(400).json({ error: "Please enter a valid name (letters only, min 2 characters)" });
  }

  if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
    return res.status(400).json({ error: "Please enter a valid 10-digit Indian mobile number" });
  }

  if (trimmedAddress.length < 5) {
    return res.status(400).json({ error: "Please enter a valid address (min 5 characters)" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }

  if (trimmedPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  console.log("Register attempt:", trimmedEmail);



  try {


    // Create Auth User

    const {
      data,
      error
    } = await globalSupabase.auth.admin.createUser({

      email: trimmedEmail,

      password: trimmedPassword,

      email_confirm:true

    });



    if(error){

      console.log("Create user error:", error);

      return res.status(400).json({
        error:error.message
      });

    }





    console.log(
      "User created:",
      data.user.id
    );



    const userId = data.user.id;





    // Insert Profile Data

    const {
      error:profileError
    } = await globalSupabase
    .from("profiles")
    .insert([{

      id:userId,

      name:trimmedName,
      phone: trimmedPhone,

      address:trimmedAddress,

      email:trimmedEmail,

      role:"user"

    }]);





    if(profileError){

      console.log(
        "Profile insert error:",
        profileError
      );


      return res.status(400).json({
        error:profileError.message
      });

    }





    console.log(
      "Profile created"
    );



    return res.status(200).json({

      message:"User registered successfully"

    });



  }

  catch(err){


    console.log(
      "Register catch error:",
      err
    );


    return res.status(500).json({

      error:err.message

    });


  }


});



module.exports = router;