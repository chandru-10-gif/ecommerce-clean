const placeOrder = async () => {
  try {
    // Check cart
    if (state.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // Get logged in user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    console.log("Logged User:", user);
    console.log("Cart Items:", state);

    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    // Calculate total amount
    const totalAmount = state.reduce(
      (sum, item) => sum + item.price * item.count,
      0
    );

    console.log("Total Amount:", totalAmount);

    // Create Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: "Pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order Error:", orderError);
      throw orderError;
    }

    console.log("Order Created:", order);

    // Prepare Order Items
    const orderItems = state.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_title: item.title,
      image: item.image,
      quantity: item.count,
      price: item.price,
    }));

    console.log("Order Items:", orderItems);

    // Save Order Items
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order Items Error:", itemsError);
      throw itemsError;
    }

    console.log("Order Items Saved");

    alert("Order placed successfully!");

    // Clear local cart if needed
    // localStorage.removeItem("cart");

    navigate("/success");
  } catch (err) {
    console.error("Place Order Error:", err);
    alert(err.message || "Failed to place order");
  }
};