// Complete PHF Pet Database - 109 Pets with PHI Data
// This file contains all pets with owner information (PHI)
// All text is lowercased for minimalist design consistency

export interface PetData {
  id: number;
  name: string;
  type: 'Dog' | 'Cat' | 'Guinea Pig' | 'Fish' | 'Bird';
  tower: string;
  apartment: string;
  image: string;
  status: 'online' | 'away' | 'offline';
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  medicalNotes: string;
  emergencyContact: string;
}

// Generate realistic PHI data for demonstration (all lowercased)
const generateOwnerData = (petId: number, petName: string) => ({
  ownerName: `owner of ${petName.toLowerCase()}`,
  ownerPhone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
  ownerEmail: `owner.${petName.toLowerCase()}@phf.com`,
  medicalNotes: `pet ${petId} - ${petName.toLowerCase()}: up-to-date on all vaccinations. regular vet checkups. no known allergies.`,
  emergencyContact: `emergency contact for ${petName.toLowerCase()}: +91-${Math.floor(Math.random() * 9000000000) + 1000000000}`
});

export const ALL_PETS: PetData[] = [
  // Tower 1 (5 pets)
  { id: 1, name: 'lily', type: 'Dog', tower: 'Tower 1', apartment: '1022', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200', status: 'online', ...generateOwnerData(1, 'lily') },
  { id: 2, name: 'cinnamon', type: 'Cat', tower: 'Tower 1', apartment: '1142', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200', status: 'online', ...generateOwnerData(2, 'cinnamon') },
  { id: 3, name: 'minnie', type: 'Dog', tower: 'Tower 1', apartment: '1144', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200', status: 'online', ...generateOwnerData(3, 'minnie') },
  { id: 4, name: 'shadow', type: 'Dog', tower: 'Tower 1', apartment: '1242', image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=200', status: 'online', ...generateOwnerData(4, 'shadow') },
  { id: 5, name: 'simba', type: 'Dog', tower: 'Tower 1', apartment: '1291', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200', status: 'online', ...generateOwnerData(5, 'simba') },

  // Tower 2 (16 pets)
  { id: 6, name: 'sky', type: 'Dog', tower: 'Tower 2', apartment: '2041', image: 'https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=200', status: 'online', ...generateOwnerData(6, 'sky') },
  { id: 7, name: 'leo', type: 'Dog', tower: 'Tower 2', apartment: '2042', image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=200', status: 'away', ...generateOwnerData(7, 'leo') },
  { id: 8, name: 'simba', type: 'Dog', tower: 'Tower 2', apartment: '2058', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200', status: 'online', ...generateOwnerData(8, 'simba') },
  { id: 9, name: 'donut', type: 'Dog', tower: 'Tower 2', apartment: '2091', image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=200', status: 'online', ...generateOwnerData(9, 'donut') },
  { id: 10, name: 'jax', type: 'Dog', tower: 'Tower 2', apartment: '2092', image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200', status: 'online', ...generateOwnerData(10, 'jax') },
  { id: 11, name: 'happy', type: 'Dog', tower: 'Tower 2', apartment: '2128', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', status: 'online', ...generateOwnerData(11, 'happy') },
  { id: 12, name: 'ricky', type: 'Dog', tower: 'Tower 2', apartment: '2153', image: 'https://images.unsplash.com/photo-1598133893773-de3574464cc0?w=200', status: 'online', ...generateOwnerData(12, 'ricky') },
  { id: 13, name: 'millie', type: 'Dog', tower: 'Tower 2', apartment: '2157', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=200', status: 'online', ...generateOwnerData(13, 'millie') },
  { id: 14, name: 'dollar', type: 'Dog', tower: 'Tower 2', apartment: '2176', image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200', status: 'online', ...generateOwnerData(14, 'dollar') },
  { id: 15, name: 'momo', type: 'Dog', tower: 'Tower 2', apartment: '2195', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=200', status: 'online', ...generateOwnerData(15, 'momo') },
  { id: 16, name: 'chico', type: 'Cat', tower: 'Tower 2', apartment: '2222', image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200', status: 'away', ...generateOwnerData(16, 'chico') },
  { id: 17, name: 'choco', type: 'Dog', tower: 'Tower 2', apartment: '2257', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200', status: 'online', ...generateOwnerData(17, 'choco') },
  { id: 18, name: 'zazu', type: 'Cat', tower: 'Tower 2', apartment: '2268', image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=200', status: 'online', ...generateOwnerData(18, 'zazu') },
  { id: 19, name: 'shifu', type: 'Cat', tower: 'Tower 2', apartment: '2268', image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=200', status: 'online', ...generateOwnerData(19, 'shifu') },
  { id: 20, name: 'pablo', type: 'Cat', tower: 'Tower 2', apartment: '2334', image: 'https://images.unsplash.com/photo-1573865526739-10c1dd7aa43c?w=200', status: 'away', ...generateOwnerData(20, 'pablo') },
  { id: 21, name: 'leo', type: 'Cat', tower: 'Tower 2', apartment: '2334', image: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=200', status: 'away', ...generateOwnerData(21, 'leo') },

  // Tower 3 (11 pets)
  { id: 22, name: 'rio', type: 'Dog', tower: 'Tower 3', apartment: '3066', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200', status: 'online', ...generateOwnerData(22, 'rio') },
  { id: 23, name: 'posto', type: 'Dog', tower: 'Tower 3', apartment: '3202', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=200', status: 'away', ...generateOwnerData(23, 'posto') },
  { id: 24, name: 'milo', type: 'Dog', tower: 'Tower 3', apartment: '3247', image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=200', status: 'online', ...generateOwnerData(24, 'milo') },
  { id: 25, name: 'luna', type: 'Cat', tower: 'Tower 3', apartment: '3305', image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200', status: 'online', ...generateOwnerData(25, 'luna') },
  { id: 26, name: 'rumi', type: 'Cat', tower: 'Tower 3', apartment: '3305', image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200', status: 'online', ...generateOwnerData(26, 'rumi') },
  { id: 27, name: 'june', type: 'Cat', tower: 'Tower 3', apartment: '3305', image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=200', status: 'online', ...generateOwnerData(27, 'june') },
  { id: 28, name: 'simba', type: 'Dog', tower: 'Tower 3', apartment: '3316', image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=200', status: 'online', ...generateOwnerData(28, 'simba') },
  { id: 29, name: 'fluffy', type: 'Cat', tower: 'Tower 3', apartment: '3332', image: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=200', status: 'away', ...generateOwnerData(29, 'fluffy') },
  { id: 30, name: 'snow', type: 'Cat', tower: 'Tower 3', apartment: '3332', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200', status: 'away', ...generateOwnerData(30, 'snow') },
  { id: 31, name: 'niko', type: 'Dog', tower: 'Tower 3', apartment: '3348', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200', status: 'online', ...generateOwnerData(31, 'niko') },
  { id: 32, name: 'zuri', type: 'Dog', tower: 'Tower 3', apartment: '3348', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=200', status: 'online', ...generateOwnerData(32, 'zuri') },

  // Tower 4 (13 pets)
  { id: 33, name: 'rio', type: 'Dog', tower: 'Tower 4', apartment: '4026', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200', status: 'online', ...generateOwnerData(33, 'rio') },
  { id: 34, name: 'goal', type: 'Dog', tower: 'Tower 4', apartment: '4117', image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=200', status: 'online', ...generateOwnerData(34, 'goal') },
  { id: 35, name: 'doobie', type: 'Dog', tower: 'Tower 4', apartment: '4128', image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=200', status: 'online', ...generateOwnerData(35, 'doobie') },
  { id: 36, name: 'gara', type: 'Cat', tower: 'Tower 4', apartment: '4167', image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=200', status: 'online', ...generateOwnerData(36, 'gara') },
  { id: 37, name: 'leo', type: 'Cat', tower: 'Tower 4', apartment: '4167', image: 'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?w=200', status: 'online', ...generateOwnerData(37, 'leo') },
  { id: 38, name: 'coco', type: 'Dog', tower: 'Tower 4', apartment: '4171', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', status: 'online', ...generateOwnerData(38, 'coco') },
  { id: 39, name: 'kydow', type: 'Dog', tower: 'Tower 4', apartment: '4177', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200', status: 'online', ...generateOwnerData(39, 'kydow') },
  { id: 40, name: 'bubbles', type: 'Dog', tower: 'Tower 4', apartment: '4191', image: 'https://images.unsplash.com/photo-1598133893773-de3574464cc0?w=200', status: 'online', ...generateOwnerData(40, 'bubbles') },
  { id: 41, name: 'snowbell', type: 'Dog', tower: 'Tower 4', apartment: '4195', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=200', status: 'online', ...generateOwnerData(41, 'snowbell') },
  { id: 42, name: 'kyra', type: 'Dog', tower: 'Tower 4', apartment: '4236', image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=200', status: 'online', ...generateOwnerData(42, 'kyra') },
  { id: 43, name: 'pepper', type: 'Dog', tower: 'Tower 4', apartment: '4284', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=200', status: 'online', ...generateOwnerData(43, 'pepper') },
  { id: 44, name: 'kittu', type: 'Cat', tower: 'Tower 4', apartment: '4342', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200', status: 'online', ...generateOwnerData(44, 'kittu') },
  { id: 106, name: 'tyrian', type: 'Dog', tower: 'Tower 4', apartment: '4056', image: 'https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=200', status: 'online', ...generateOwnerData(106, 'tyrian') },

  // Tower 5 (8 pets)
  { id: 45, name: 'frosty', type: 'Dog', tower: 'Tower 5', apartment: '5013', image: 'https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=200', status: 'online', ...generateOwnerData(45, 'frosty') },
  { id: 46, name: 'biscuit', type: 'Dog', tower: 'Tower 5', apartment: '5071', image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=200', status: 'online', ...generateOwnerData(46, 'biscuit') },
  { id: 47, name: 'luna', type: 'Dog', tower: 'Tower 5', apartment: '5081', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200', status: 'online', ...generateOwnerData(47, 'luna') },
  { id: 48, name: 'ollie', type: 'Dog', tower: 'Tower 5', apartment: '5181', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200', status: 'online', ...generateOwnerData(48, 'ollie') },
  { id: 49, name: 'lexi', type: 'Dog', tower: 'Tower 5', apartment: '5202', image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=200', status: 'online', ...generateOwnerData(49, 'lexi') },
  { id: 50, name: 'honey', type: 'Dog', tower: 'Tower 5', apartment: '5221', image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200', status: 'online', ...generateOwnerData(50, 'honey') },
  { id: 51, name: 'coco', type: 'Dog', tower: 'Tower 5', apartment: '5221', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', status: 'online', ...generateOwnerData(51, 'coco') },
  { id: 52, name: 'miffy', type: 'Dog', tower: 'Tower 5', apartment: '5301', image: 'https://images.unsplash.com/photo-1598133893773-de3574464cc0?w=200', status: 'online', ...generateOwnerData(52, 'miffy') },

  // Tower 6 (9 pets)
  { id: 53, name: 'joy', type: 'Dog', tower: 'Tower 6', apartment: '6032', image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=200', status: 'online', ...generateOwnerData(53, 'joy') },
  { id: 54, name: 'theo', type: 'Dog', tower: 'Tower 6', apartment: '6034', image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200', status: 'online', ...generateOwnerData(54, 'theo') },
  { id: 55, name: 'zakk', type: 'Dog', tower: 'Tower 6', apartment: '6052', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200', status: 'online', ...generateOwnerData(55, 'zakk') },
  { id: 56, name: 'zoey', type: 'Dog', tower: 'Tower 6', apartment: '6124', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=200', status: 'online', ...generateOwnerData(56, 'zoey') },
  { id: 57, name: 'chloe', type: 'Dog', tower: 'Tower 6', apartment: '6124', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200', status: 'online', ...generateOwnerData(57, 'chloe') },
  { id: 58, name: 'neo', type: 'Dog', tower: 'Tower 6', apartment: '6183', image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=200', status: 'online', ...generateOwnerData(58, 'neo') },
  { id: 59, name: 'luna', type: 'Cat', tower: 'Tower 6', apartment: '6183', image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200', status: 'offline', ...generateOwnerData(59, 'luna') },
  { id: 60, name: 'tintin', type: 'Dog', tower: 'Tower 6', apartment: '6193', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=200', status: 'online', ...generateOwnerData(60, 'tintin') },
  { id: 61, name: 'loki', type: 'Dog', tower: 'Tower 6', apartment: '6254', image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=200', status: 'online', ...generateOwnerData(61, 'loki') },

  // Tower 7 (11 pets)
  { id: 62, name: 'rex', type: 'Dog', tower: 'Tower 7', apartment: '7031', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200', status: 'online', ...generateOwnerData(62, 'rex') },
  { id: 63, name: 'bruno', type: 'Dog', tower: 'Tower 7', apartment: '7146', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200', status: 'online', ...generateOwnerData(63, 'bruno') },
  { id: 64, name: 'alien', type: 'Dog', tower: 'Tower 7', apartment: '7172', image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=200', status: 'online', ...generateOwnerData(64, 'alien') },
  { id: 65, name: 'jojo', type: 'Guinea Pig', tower: 'Tower 7', apartment: '7182', image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=200', status: 'online', ...generateOwnerData(65, 'jojo') },
  { id: 66, name: 'thor', type: 'Dog', tower: 'Tower 7', apartment: '7193', image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=200', status: 'online', ...generateOwnerData(66, 'thor') },
  { id: 67, name: 'tuffy', type: 'Dog', tower: 'Tower 7', apartment: '7267', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200', status: 'online', ...generateOwnerData(67, 'tuffy') },
  { id: 68, name: 'muffin', type: 'Dog', tower: 'Tower 7', apartment: '7294', image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=200', status: 'online', ...generateOwnerData(68, 'muffin') },
  { id: 69, name: 'bounce', type: 'Dog', tower: 'Tower 7', apartment: '7323', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200', status: 'online', ...generateOwnerData(69, 'bounce') },
  { id: 70, name: 'benzi', type: 'Dog', tower: 'Tower 7', apartment: '7323', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=200', status: 'online', ...generateOwnerData(70, 'benzi') },
  { id: 71, name: 'bubbles', type: 'Cat', tower: 'Tower 7', apartment: '7323', image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=200', status: 'online', ...generateOwnerData(71, 'bubbles') },
  { id: 72, name: 'checo', type: 'Dog', tower: 'Tower 7', apartment: '7328', image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=200', status: 'online', ...generateOwnerData(72, 'checo') },

  // Tower 8 (11 pets)
  { id: 73, name: 'tuffy', type: 'Dog', tower: 'Tower 8', apartment: '8053', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200', status: 'online', ...generateOwnerData(73, 'tuffy') },
  { id: 74, name: 'ollie', type: 'Dog', tower: 'Tower 8', apartment: '8061', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200', status: 'online', ...generateOwnerData(74, 'ollie') },
  { id: 75, name: 'zoey', type: 'Dog', tower: 'Tower 8', apartment: '8076', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=200', status: 'online', ...generateOwnerData(75, 'zoey') },
  { id: 76, name: 'bingo', type: 'Dog', tower: 'Tower 8', apartment: '8103', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', status: 'online', ...generateOwnerData(76, 'bingo') },
  { id: 77, name: 'ceasar', type: 'Dog', tower: 'Tower 8', apartment: '8125', image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200', status: 'online', ...generateOwnerData(77, 'ceasar') },
  { id: 78, name: 'hachiko', type: 'Dog', tower: 'Tower 8', apartment: '8196', image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=200', status: 'online', ...generateOwnerData(78, 'hachiko') },
  { id: 79, name: 'koko', type: 'Dog', tower: 'Tower 8', apartment: '8243', image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=200', status: 'online', ...generateOwnerData(79, 'koko') },
  { id: 80, name: 'coco', type: 'Dog', tower: 'Tower 8', apartment: '8268', image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=200', status: 'online', ...generateOwnerData(80, 'coco') },
  { id: 81, name: 'simba', type: 'Cat', tower: 'Tower 8', apartment: '8272', image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200', status: 'online', ...generateOwnerData(81, 'simba') },
  { id: 82, name: 'pixel', type: 'Dog', tower: 'Tower 8', apartment: '8335', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200', status: 'online', ...generateOwnerData(82, 'pixel') },
  { id: 83, name: 'bravo', type: 'Dog', tower: 'Tower 8', apartment: '8335', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=200', status: 'online', ...generateOwnerData(83, 'bravo') },

  // Tower 9 (7 pets)
  { id: 84, name: 'leo', type: 'Cat', tower: 'Tower 9', apartment: '9031', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200', status: 'online', ...generateOwnerData(84, 'leo') },
  { id: 85, name: 'hachi', type: 'Dog', tower: 'Tower 9', apartment: '9116', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200', status: 'online', ...generateOwnerData(85, 'hachi') },
  { id: 86, name: 'kayla', type: 'Dog', tower: 'Tower 9', apartment: '9172', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200', status: 'online', ...generateOwnerData(86, 'kayla') },
  { id: 87, name: 'rico', type: 'Dog', tower: 'Tower 9', apartment: '9178', image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=200', status: 'online', ...generateOwnerData(87, 'rico') },
  { id: 88, name: 'diva', type: 'Dog', tower: 'Tower 9', apartment: '9268', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200', status: 'online', ...generateOwnerData(88, 'diva') },
  { id: 89, name: 'dude', type: 'Dog', tower: 'Tower 9', apartment: '9268', image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=200', status: 'online', ...generateOwnerData(89, 'dude') },
  { id: 90, name: 'scooby', type: 'Dog', tower: 'Tower 9', apartment: '9292', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200', status: 'online', ...generateOwnerData(90, 'scooby') },

  // Tower 10 (17 pets)
  { id: 91, name: 'coco', type: 'Dog', tower: 'Tower 10', apartment: '10036', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', status: 'online', ...generateOwnerData(91, 'coco') },
  { id: 92, name: 'the fish', type: 'Fish', tower: 'Tower 10', apartment: '10053', image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200', status: 'away', ...generateOwnerData(92, 'the fish') },
  { id: 93, name: 'zaazou', type: 'Dog', tower: 'Tower 10', apartment: '10056', image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=200', status: 'online', ...generateOwnerData(93, 'zaazou') },
  { id: 94, name: 'ronny', type: 'Bird', tower: 'Tower 10', apartment: '10115', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200', status: 'away', ...generateOwnerData(94, 'ronny') },
  { id: 95, name: 'rocky', type: 'Bird', tower: 'Tower 10', apartment: '10115', image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=200', status: 'away', ...generateOwnerData(95, 'rocky') },
  { id: 96, name: 'rio', type: 'Dog', tower: 'Tower 10', apartment: '10143', image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200', status: 'away', ...generateOwnerData(96, 'rio') },
  { id: 97, name: 'milo', type: 'Dog', tower: 'Tower 10', apartment: '10144', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=200', status: 'online', ...generateOwnerData(97, 'milo') },
  { id: 98, name: 'moira', type: 'Dog', tower: 'Tower 10', apartment: '10242', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=200', status: 'online', ...generateOwnerData(98, 'moira') },
  { id: 99, name: 'charlie', type: 'Dog', tower: 'Tower 10', apartment: '10264', image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=200', status: 'online', ...generateOwnerData(99, 'charlie') },
  { id: 100, name: 'buddy', type: 'Dog', tower: 'Tower 10', apartment: '10265', image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=200', status: 'online', ...generateOwnerData(100, 'buddy') },
  { id: 101, name: 'scooby', type: 'Dog', tower: 'Tower 10', apartment: '10265', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200', status: 'online', ...generateOwnerData(101, 'scooby') },
  { id: 102, name: 'coco', type: 'Dog', tower: 'Tower 10', apartment: '10267', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200', status: 'online', ...generateOwnerData(102, 'coco') },
  { id: 103, name: 'leo', type: 'Dog', tower: 'Tower 10', apartment: '10272', image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=200', status: 'online', ...generateOwnerData(103, 'leo') },
  { id: 104, name: 'leo', type: 'Cat', tower: 'Tower 10', apartment: '10285', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200', status: 'online', ...generateOwnerData(104, 'leo') },
  { id: 105, name: 'ginger', type: 'Dog', tower: 'Tower 10', apartment: '10328', image: 'https://images.unsplash.com/photo-1598133893773-de3574464cc0?w=200', status: 'online', ...generateOwnerData(105, 'ginger') },
  { id: 107, name: 'bolt', type: 'Dog', tower: 'Tower 10', apartment: '10335', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200', status: 'online', ...generateOwnerData(107, 'bolt') },
  { id: 108, name: 'akira', type: 'Dog', tower: 'Tower 10', apartment: '10345', image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200', status: 'online', ...generateOwnerData(108, 'akira') },
];
