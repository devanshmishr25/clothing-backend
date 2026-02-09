import Address from "../models/Address.js";

// Get addresses
export async function getAddresses(req, res) {
  const addresses = await Address.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json(addresses);
}

// Add address
export async function addAddress(req, res) {
  const data = req.body;

  if (data.isDefault) {
    await Address.updateMany(
      { user: req.user.id },
      { isDefault: false }
    );
  }

  const address = await Address.create({
    ...data,
    user: req.user.id
  });

  res.status(201).json(address);
}

// Update address
export async function updateAddress(req, res) {
  const data = req.body;

  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!address)
    return res.status(404).json({ message: "Address not found" });

  if (data.isDefault) {
    await Address.updateMany(
      { user: req.user.id },
      { isDefault: false }
    );
  }

  Object.assign(address, data);
  await address.save();

  res.json(address);
}

// Delete address
export async function deleteAddress(req, res) {
  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!address)
    return res.status(404).json({ message: "Address not found" });

  res.json({ message: "Address deleted" });
}