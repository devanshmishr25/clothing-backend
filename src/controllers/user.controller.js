import User from "../models/User.js";

// GET profile
export async function getMyProfile(req, res) {
  const user = await User.findById(req.user.id).select("-password");

  if (!user)
    return res.status(404).json({ message: "User not found" });

  res.json(user);
}

// UPDATE profile
export async function updateMyProfile(req, res) {
  const { name, phone, avatar } = req.body;

  const user = await User.findById(req.user.id);
  if (!user)
    return res.status(404).json({ message: "User not found" });

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  await user.save();

  res.json({
    message: "Profile updated",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar
    }
  });
}
