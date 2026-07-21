const getUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*");

  if (!error) {
    setUsers(data);
  }
};