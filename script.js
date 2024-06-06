const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// Directory containing the images
const imageDir = path.join(__dirname, "public/images");

// URL for adding items
const url = "http://localhost:3000/items/add";

// List of categories to choose from
const categories = [
  "Appetizers",
  "Main Course",
  "Desserts",
  "Snacks",
  "Drinks",
];

// Function to generate item details based on the filename
function generateItemDetails(filename) {
  const baseName = path.parse(filename).name.replace(/-/g, " "); // Replace hyphens with spaces to get the item name
  const itemName = baseName;

  // Generate a random price between 150 and 1000, in multiples of 50
  const price = Math.floor(Math.random() * 18 + 3) * 50;

  // Select a random category
  const category = categories[Math.floor(Math.random() * categories.length)];

  // Generate a random cook time between 10 and 60 minutes
  const cookTime = `${Math.floor(Math.random() * 51 + 10)} minutes`;

  return { itemName, price, category, cookTime };
}

// Function to send a POST request to add the item
async function addItem(name, imgUrl, price, cookTime, category) {
  const data = {
    name: name,
    img_url: imgUrl,
    price: price,
    cook_time: cookTime,
    category: category,
  };
  console.log(data);
  try {
    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.status === 200) {
      console.log(`Successfully added item: ${name}`);
    } else {
      console.log(`Failed to add item: ${name}, Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Failed to add item: ${name}, Error: ${error.message}`);
  }
}

// Read image files and add items
fs.readdir(imageDir, async (err, files) => {
  if (err) {
    console.error("Error reading image directory:", err);
    return;
  }

  for (const filename of files) {
    if (
      [".png", ".jpg", ".jpeg", ".webp"].includes(
        path.extname(filename).toLowerCase()
      )
    ) {
      const imgUrl = `/public/images/${filename}`; // Adjust the path accordingly
      const { itemName, price, category, cookTime } =
        generateItemDetails(filename);
      if (itemName && price && category && cookTime) {
        await addItem(itemName, imgUrl, price, cookTime, category);
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 10 seconds before the next request
      } else {
        console.log(`Failed to generate details for item: ${filename}`);
      }
    }
  }
});
