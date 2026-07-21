app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Login user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    // Get profile
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(400).json({
        error: "Profile not found",
      });
    }

    // Success
    res.json({
  message: "Login successful",
  token: data.session.access_token,

  user: {
    id: data.user.id,
    email: data.user.email,
  },

  profile: {
    role: profile.role,
    user_code: profile.user_code,
  },
});

  } catch (err) {
    console.log("LOGIN ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});