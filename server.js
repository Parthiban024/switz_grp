const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const path = require('path'); // Import the path module
const fs = require('fs'); // Import the fs module to check if directory exists

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://ParthiGMR:Parthiban7548@parthibangmr.1quwer2.mongodb.net/empmonit', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// User model
const User = require('./models/login');

// JWT secret key
const secretKey = 'testing';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Data model
const Data = require('./models/data');
const data2 = require('./models/data2');
const data3 = require('./models/data3');
const data4 = require('./models/dataFour');
const data5 = require('./models/dataFive');

// Ensure that the uploads directory exists or create it
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}



// Routes
app.post('/login', (req, res) => {
    // Authenticate user
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
      const token = jwt.sign({ username }, secretKey);
      res.json({ token });
    } else {
      res.sendStatus(401);
    }
  });

// Set up multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
  
  // Serve static files (images)
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  // Handle POST request to /data
app.post('/data', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const imageUrl1 = req.files['image1'][0] ? req.files['image1'][0].filename : '';
    const imageUrl2 = req.files['image2'][0] ? req.files['image2'][0].filename : '';

    if (!imageUrl1 || !imageUrl2) {
      return res.status(400).json({ error: 'Both image files are required' });
    }

    const newData = new Data({
      title,
      description,
      filename1: imageUrl1,
      filename2: imageUrl2
    });
    await newData.save();

    res.status(201).json({ message: 'Data submitted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  
  
  // Get all data
  // app.get('/data', authenticateToken, async (req, res) => {
    app.get('/data', async (req, res) => {
    try {
      const data = await Data.find();
      res.json(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  
  // Delete data by ID
// app.delete('/data/:id', authenticateToken, async (req, res) => {
  app.delete('/data/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await Data.findByIdAndDelete(id);
      res.status(200).json({ message: 'Data deleted successfully' });
    } catch (error) {
      console.error('Error deleting data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get data by ID
  // app.get('/data/:id', authenticateToken, async (req, res) => {
    app.get('/data/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const data = await Data.findById(id);
      res.json(data);
    } catch (error) {
      console.error('Error fetching data by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Update data by ID
// POST request to update data by ID
// Handle PUT request to update data by ID
app.put('/data/:id', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    let imageUrl1 = '';
    let imageUrl2 = '';

    if (req.files['image1']) {
      imageUrl1 = req.files['image1'][0].filename;
    }
    if (req.files['image2']) {
      imageUrl2 = req.files['image2'][0].filename;
    }

    // Find the data entry by ID
    const data = await Data.findById(id);

    // Update the title and description
    data.title = title;
    data.description = description;

    // Update the image filenames if new images are provided
    if (imageUrl1) {
      data.filename1 = imageUrl1;
    }
    if (imageUrl2) {
      data.filename2 = imageUrl2;
    }

    // Save the updated data entry
    await data.save();

    res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



  
// Handle POST request to /new-data
app.post('/new-data', upload.single('image'), async (req, res) => {
  try {
    const { title, description, funding, investment, announced } = req.body;
    const filename = req.file ? req.file.filename : '';

    // Create a new data entry
    const newData = new data2({
      title,
      description,
      funding,
      investment,
      announced,
      filename
    });

    // Save the new data entry to the database
    await newData.save();

    res.status(201).json({ message: 'New data submitted successfully' });
  } catch (error) {
    console.error('Error submitting new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve all new data entries
app.get('/new-data', async (req, res) => {
  try {
    const newData = await data2.find();
    res.json(newData);
  } catch (error) {
    console.error('Error fetching new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// DELETE endpoint to delete a new data entry by ID
app.delete('/new-data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await data2.findByIdAndDelete(id);
    res.status(200).json({ message: 'New data deleted successfully' });
  } catch (error) {
    console.error('Error deleting new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/new-data/:id', async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from request parameters
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Query data by ID
    const data = await data2.findById(id); // Use the extracted ID to find data entry

    // Check if data entry exists
    if (!data) {
      return res.status(404).json({ error: 'Data entry not found' });
    }

    // Return data entry
    res.json(data);
  } catch (error) {
    console.error('Error fetching data by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// PUT endpoint to update data by ID
app.put('/new-data/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, funding, investment, announced } = req.body;
    const filename = req.file ? req.file.filename : '';

    // Ensure the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Find the data entry by ID
    let newData = await data2.findById(id);

    // If the data entry doesn't exist, return 404
    if (!newData) {
      return res.status(404).json({ error: 'Data not found' });
    }

    // Update the fields
    newData.title = title;
    newData.description = description;
    newData.funding = funding;
    newData.investment = investment;
    newData.announced = announced;
    if (filename) {
      newData.filename = filename;
    }

    // Save the updated data entry
    newData = await newData.save();

    res.status(200).json({ message: 'Data updated successfully', newData });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Handle POST request to /new-data
app.post('/new-data2', upload.single('image3'), async (req, res) => {
  try {
    const {  description } = req.body;
    const filename = req.file ? req.file.filename : '';

    // Create a new data entry
    const newData = new data3({
      filename,
      description,
     
    });

    // Save the new data entry to the database
    await newData.save();

    res.status(201).json({ message: 'New data submitted successfully' });
  } catch (error) {
    console.error('Error submitting new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve all new data entries
app.get('/new-data2', async (req, res) => {
  try {
    const newData = await data3.find();
    res.json(newData);
  } catch (error) {
    console.error('Error fetching new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE endpoint to delete a new data entry by ID
app.delete('/new-data2/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await data3.findByIdAndDelete(id);
    res.status(200).json({ message: 'New data deleted successfully' });
  } catch (error) {
    console.error('Error deleting new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle PUT request to update data by ID
app.put('/new-data2/:id', upload.single('image3'), async (req, res) => {
  try {
    const { id } = req.params;
    const newData = {};
    if (req.body.description) {
      newData.description = req.body.description;
    }
    if (req.file) {
      const filename = req.file.filename;
      newData.filename = filename;
    }

    await data3.findByIdAndUpdate(id, newData);
    res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve data by ID
app.get('/new-data2/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const newData = await data3.findById(id);
    res.json(newData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle POST request to /new-data2
app.post('/new-data-one', async (req, res) => {
  try {
    const { productNews, innovation } = req.body;

    // Create a new data entry
    const newData = new data4({
      productNews,
      innovation
    });

    // Save the new data entry to the database
    await newData.save();

    res.status(201).json({ message: 'New data submitted successfully' });
  } catch (error) {
    console.error('Error submitting new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve all new data entries
app.get('/new-data-one', async (req, res) => {
  try {
    const newData = await data4.find();
    res.json(newData);
  } catch (error) {
    console.error('Error fetching new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET endpoint to retrieve data by ID
app.get('/new-data-one/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const newData = await data4.findById(id);
    res.json(newData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// DELETE endpoint to delete a new data entry by ID
app.delete('/new-data-one/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await data4.findByIdAndDelete(id);
    res.status(200).json({ message: 'New data deleted successfully' });
  } catch (error) {
    console.error('Error deleting new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Handle PUT request to update data by ID
app.put('/new-data-one/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const newData = {};

    if (req.body.productNews) {
      newData.productNews = req.body.productNews;
    }
    if (req.body.innovation) {
      newData.innovation = req.body.innovation;
    }
  
    await data4.findByIdAndUpdate(id, newData);
    res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Handle POST request to /new-data2
app.post('/new-data-two', async (req, res) => {
  try {
    const { productNews, innovation } = req.body;

    // Create a new data entry
    const newData = new data5({
      productNews,
      innovation
    });

    // Save the new data entry to the database
    await newData.save();

    res.status(201).json({ message: 'New data submitted successfully' });
  } catch (error) {
    console.error('Error submitting new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve all new data entries
app.get('/new-data-two', async (req, res) => {
  try {
    const newData = await data5.find();
    res.json(newData);
  } catch (error) {
    console.error('Error fetching new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve data by ID
app.get('/new-data-two/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const newData = await data5.findById(id);
    res.json(newData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE endpoint to delete a new data entry by ID
app.delete('/new-data-two/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await data5.findByIdAndDelete(id);
    res.status(200).json({ message: 'New data deleted successfully' });
  } catch (error) {
    console.error('Error deleting new data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle PUT request to update data by ID
app.put('/new-data-two/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const newData = {};

    if (req.body.productNews) {
      newData.productNews = req.body.productNews;
    }
    if (req.body.innovation) {
      newData.innovation = req.body.innovation;
    }
  
    await data5.findByIdAndUpdate(id, newData);
    res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// MongoDB schema
const dataSchema = new mongoose.Schema({
  industryGroup: String,
  mean: String,
  median: String
});

const DataApi = mongoose.model('DataApi', dataSchema);

// Middleware
app.use(express.json());

// Routes
app.get('/api/data', async (req, res) => {
  try {
    const data = await DataApi.find();
    res.json(data);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const newData = req.body;
    const createdData = await DataApi.create(newData);
    res.json(createdData);
  } catch (err) {
    console.error("Error creating data:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/data/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const result = await DataApi.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(result);
  } catch (err) {
    console.error("Error updating data:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/data/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await DataApi.findByIdAndDelete(id);
    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    console.error("Error deleting data:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


// models/ChartData.js


const chartDataSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  flagImage: {
    type: String, // Store the path to the image file
    required: true,
  },
});

const ChartData = mongoose.model('ChartData', chartDataSchema);

module.exports = ChartData;


// Handle POST request to create chart data
// Update the route for handling POST request to create chart data
app.post('/api/chartdata', upload.single('flagImage'), async (req, res) => {
  try {
    const { country, percentage } = req.body;
    const flagImage = req.file ? req.file.path : '';

    if (!flagImage) {
      return res.status(400).json({ error: 'Flag image file is required' });
    }

    const newChartData = new ChartData({
      country,
      percentage,
      flagImage
    });

    await newChartData.save();

    res.status(201).json({ message: 'Chart data submitted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Handle GET request to fetch all chart data
app.get('/api/chartdata', async (req, res) => {
  try {
    const chartData = await ChartData.find();
    res.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle DELETE request to delete chart data by ID
app.delete('/api/chartdata/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await ChartData.findByIdAndDelete(id);
    res.status(200).json({ message: 'Chart data deleted successfully' });
  } catch (error) {
    console.error('Error deleting chart data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle PUT request to update chart data by ID
app.put('/api/chartdata/:id', upload.single('flagImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { country, percentage } = req.body;
    let flagImage = '';

    if (req.file) {
      flagImage = req.file.path;
    }

    const updatedData = {
      country,
      percentage,
      flagImage
    };

    const updatedChartData = await ChartData.findByIdAndUpdate(id, updatedData, { new: true });
    res.json(updatedChartData);
  } catch (error) {
    console.error('Error updating chart data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const homeSchema = new mongoose.Schema({
  heading: String,
  paragraph1: String,
  paragraph2: String
});

const Home = mongoose.model('Home', homeSchema);
module.exports = Home;
// GET home data
app.get('/api/home', async (req, res) => {
  try {
    const homeData = await Home.findOne();
    res.json(homeData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST home data
app.post('/api/home', async (req, res) => {
  const homeData = new Home({
    heading: req.body.heading,
    paragraph1: req.body.paragraph1,
    paragraph2: req.body.paragraph2
  });

  try {
    const newHomeData = await homeData.save();
    res.status(201).json(newHomeData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT home data
app.put('/api/home', async (req, res) => {
  try {
    const existingHomeData = await Home.findOne();
    if (!existingHomeData) {
      return res.status(404).json({ message: 'Home data not found' });
    }
    existingHomeData.heading = req.body.heading;
    existingHomeData.paragraph1 = req.body.paragraph1;
    existingHomeData.paragraph2 = req.body.paragraph2;
    const updatedHomeData = await existingHomeData.save();
    res.json(updatedHomeData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle requests to root URL by serving the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
});
  


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
