// backend.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
// --- AWS Configuration ---



// --- ALL 150 Questions Data (Loaded here on the backend) ---
// --- ALL 150 Questions Data (Loaded here on the backend) ---
const ALL_QUESTIONS_DATA = [
    {
        question: "Which AWS service is used for scalable object storage?",
        options: ["Amazon EBS", "Amazon FSx", "Amazon S3", "AWS Lambda"],
        correctAnswerIndex: 2
    },
    {
        question: "Which compute service allows running code without provisioning servers?",
        options: ["Amazon EC2", "AWS Lambda", "Amazon EBS", "AWS SDK"],
        correctAnswerIndex: 1
    },
    {
        question: "Which AWS service provides block-level storage for EC2 instances?",
        options: ["Amazon S3", "Amazon FSx", "Amazon EBS", "Amazon EFS"],
        correctAnswerIndex: 2
    },
    {
        question: "What is the primary function of AWS CloudFront?",
        options: ["Hosting websites", "File backup", "Content Delivery Network", "Database service"],
        correctAnswerIndex: 2
    },
    {
        question: "Which AWS tool is a web-based interface to manage services?",
        options: ["AWS CLI", "AWS SDK", "AWS Console", "CloudShell"],
        correctAnswerIndex: 2
    },
    {
        question: "What is the purpose of an AMI?",
        options: ["Launch EC2 instances", "Secure networks", "Configure IAM", "Backup volumes"],
        correctAnswerIndex: 0
    },
    {
        question: "Which type of cloud allows combining public and private cloud environments?",
        options: ["Community Cloud", "Private Cloud", "Hybrid Cloud", "Edge Cloud"],
        correctAnswerIndex: 2
    },
    {
        question: "Which AWS service automatically balances traffic across multiple EC2 instances?",
        options: ["AWS Lambda", "Elastic Load Balancing", "Auto Scaling", "CloudFront"],
        correctAnswerIndex: 1
    },
    {
        question: "What is the AWS CLI used for?",
        options: ["Graphical interface", "Storage service", "Text-based AWS management", "Billing tool"],
        correctAnswerIndex: 2
    },
    {
        question: "Which service offers managed file storage accessible by multiple EC2 instances?",
        options: ["Amazon EBS", "Amazon S3", "Amazon FSx", "Amazon EFS"],
        correctAnswerIndex: 3
    },
    {
        question: "What are the 5 pillars of AWS Well-Architected Framework?",
        options: ["Security, Backup, Speed, Cost, Storage", "Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization", "Compute, Storage, Security, IAM, Backup", "Performance, Durability, Availability, Cost, Security"],
        correctAnswerIndex: 1
    },
    {
        question: "Which instance type is best for memory-intensive workloads?",
        options: ["Compute-Optimized", "Storage-Optimized", "Memory-Optimized", "General Purpose"],
        correctAnswerIndex: 2
    },
    {
        question: "Which AWS pricing option is best for short-term, unpredictable workloads?",
        options: ["Reserved Instances", "Spot Instances", "Savings Plans", "On-Demand Instances"],
        correctAnswerIndex: 3
    },
    {
        question: "What is the function of AWS Regions?",
        options: ["Cache content", "Host EC2 instances only", "Physical locations for data centers", "Security layers"],
        correctAnswerIndex: 2
    },
    {
        question: "Which AWS storage class is best for long-term archival with 12-hour retrieval?",
        options: ["S3 Standard", "S3 Glacier Instant Retrieval", "S3 Glacier Flexible Retrieval", "S3 Glacier Deep Archive"],
        correctAnswerIndex: 3
    },
    {
        question: "A startup wants to build a prototype and needs a scalable compute option with minimal upfront costs. What should they choose?",
        options: ["Reserved Instances", "On-Demand EC2", "Spot Instances", "Dedicated Hosts"],
        correctAnswerIndex: 1
    },
    {
        question: "A company wants to ensure their application remains available during hardware failure. What should they use?",
        options: ["Single AZ setup", "Auto Scaling", "Multiple Availability Zones", "Spot Instances"],
        correctAnswerIndex: 2
    },
    {
        question: "Your team needs to automate application deployment without managing infrastructure. Which compute option fits?",
        options: ["EC2", "Lambda", "Reserved Instances", "Containers"],
        correctAnswerIndex: 1
    },
    {
        question: "An e-commerce company experiences fluctuating traffic and wants to adjust compute capacity automatically. What should they use?",
        options: ["CloudFront", "Auto Scaling", "Lambda", "Route 53"],
        correctAnswerIndex: 1
    },
    {
        question: "You are storing sensitive data and need detailed control over access. Which service helps you?",
        options: ["S3", "IAM", "EC2", "EFS"],
        correctAnswerIndex: 1
    },
    {
        question: "A business with regulatory compliance needs wants a dedicated environment. Which deployment model is best?",
        options: ["Public Cloud", "Hybrid Cloud", "Private Cloud", "Multi-cloud"],
        correctAnswerIndex: 2
    },
    {
        question: "You want to deliver website content quickly to users worldwide. Which service do you use?",
        options: ["EC2", "Lambda", "CloudFront", "Route 53"],
        correctAnswerIndex: 2
    },
    {
        question: "A developer needs consistent environments to deploy microservices. What should they use?",
        options: ["EC2", "Serverless", "Containers", "Reserved Instances"],
        correctAnswerIndex: 2
    },
    {
        question: "Your company has large files and needs high-speed file access for compute instances. What should they use?",
        options: ["Amazon EFS", "Amazon FSx", "Amazon S3", "Amazon EBS"],
        correctAnswerIndex: 1
    },
    {
        question: "You want to back up only changes in storage data instead of full copies. What feature helps?",
        options: ["EBS Snapshot", "S3 Versioning", "S3 Lifecycle Policy", "AMI"],
        correctAnswerIndex: 0
    }
];


const NUMBER_OF_QUESTIONS_PER_TEST = 25; // Define the number of questions per test

// --- Express App Setup ---
const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'] // Added 127.0.0.1 for local testing
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML pages)
app.use(express.static(path.join(__dirname)));
app.get('/Login', (req, res) => res.sendFile(path.join(__dirname, 'Login.html')));
app.get('/Signup', (req, res) => res.sendFile(path.join(__dirname, 'Signup.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'Home.html'))); // Corrected to Home.html
app.get('/test', (req, res) => res.sendFile(path.join(__dirname, 'Test.html'))); // New Test.html route
app.get('/certificate', (req, res) => res.sendFile(path.join(__dirname, 'Certificate.html'))); // New Certificate.html route
app.get('/welcome', (req, res) => res.sendFile(path.join(__dirname, 'welcome.html'))); // New Certificate.html route
app.get('/Course', (req, res) => res.sendFile(path.join(__dirname, 'Course.html'))); // New Course route

app.use('/PPts', express.static(path.join(__dirname, 'PPts')));
app.get('/ppts', (req, res) => res.sendFile(path.join(__dirname, 'C:\Users\midhu\Desktop\AWS TEST - Copy\PPts'))); // New Course route
app.use('/pdfs', express.static(path.join(__dirname, 'PPts')));
app.use('/pdfs', express.static(path.join(__dirname, 'public/pdfs')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'welcome.html'))); // Default route

// Add this constant near the top


// --- Save Topic Progress ---
app.post('/save-topic-progress', authenticateUser, async (req, res) => {
    const { topicNumber } = req.body;
    const { userId } = req.user;

    if (typeof topicNumber !== 'number' || topicNumber < 1 || topicNumber > 13) {
        return res.status(400).json({ message: 'Invalid topic number.' });
    }

    const params = {
        TableName: COURSE_PROGRESS_TABLE,
        Item: {
            ProgressId: `${userId}_${topicNumber}`,
            UserId: userId,
            TopicNumber: topicNumber,
            CompletedAt: new Date().toISOString()
        }
    };

    try {
        await dynamodb.put(params).promise();
        res.status(200).json({ message: 'Topic marked as completed.' });
    } catch (error) {
        console.error('Error saving topic progress:', error);
        res.status(500).json({ message: 'Failed to save progress.' });
    }
});

// --- Get Completed Topics ---
app.get('/get-topic-progress', authenticateUser, async (req, res) => {
    const { userId } = req.user;

    const params = {
        TableName: COURSE_PROGRESS_TABLE,
        KeyConditionExpression: 'UserId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        IndexName: 'UserId-index' // You must create this GSI
    };

    try {
        const result = await dynamodb.query(params).promise();
        const completedTopics = result.Items.map(item => item.TopicNumber);
        res.status(200).json({ completedTopics });
    } catch (error) {
        console.error('Error fetching topic progress:', error);
        res.status(500).json({ message: 'Failed to fetch progress.' });
    }
});


// --- Helper Function for DynamoDB Checks ---
async function checkIfAttributeExists(tableName, indexName, attributeName, value) {
    const params = {
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: `${attributeName} = :value`,
        ExpressionAttributeValues: { ':value': value }
    };
    try {
        const result = await dynamodb.query(params).promise();
        return result.Items && result.Items.length > 0;
    } catch (error) {
        console.error(`Error checking if attribute exists in ${tableName} (${indexName}):`, error);
        throw error; // Re-throw to be caught by calling function
    }
}

// --- User Authentication Middleware ---
function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided or malformed.' });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ['HS512'] });
        req.user = decoded; // Contains { userId, username }
        next();
    } catch (error) {
        console.error('SERVER ERROR: JWT Verification FAILED:', error.message);
        return res.status(401).json({ message: error.name === 'TokenExpiredError' ? 'Token expired. Please log in again.' : 'Invalid token.' });
    }
}

// --- Signup Route ---
app.post('/signup', async (req, res) => {
    const { email, password, username, mobile } = req.body;

    if (!email || !password || !username || !mobile) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        if (await checkIfAttributeExists(USER_TABLE_NAME, 'Username-index', 'Username', username.toLowerCase())) {
            return res.status(400).json({ message: 'Username already in use.' });
        }
        if (await checkIfAttributeExists(USER_TABLE_NAME, 'Email-index', 'Email', email)) {
            return res.status(400).json({ message: 'Email already in use.' });
        }
        if (await checkIfAttributeExists(USER_TABLE_NAME, 'Mobile-index', 'Mobile', mobile)) {
            return res.status(400).json({ message: 'Mobile number already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            UserId: uuidv4(),
            Email: email,
            Mobile: mobile,
            password: hashedPassword, // Storing hashed password
            Username: username.toLowerCase(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await dynamodb.put({
            TableName: USER_TABLE_NAME,
            Item: newUser
        }).promise();

        res.status(201).json({ message: 'User created successfully. Please log in.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup: ' + error.message });
    }
});

// --- Login Route ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const result = await dynamodb.query({
            TableName: USER_TABLE_NAME,
            IndexName: 'Email-index', // Ensure this GSI exists in DynamoDB
            KeyConditionExpression: 'Email = :email',
            ExpressionAttributeValues: { ':email': email }
        }).promise();

        const user = result.Items[0];
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials: User not found.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid credentials: Password mismatch.' });
        }

        const token = jwt.sign({ userId: user.UserId, username: user.Username, email: user.Email }, SECRET_KEY, { expiresIn: '1h', algorithm: 'HS512' });
        res.status(200).json({ token, username: user.Username, userId: user.UserId, email: user.Email, mobile: user.Mobile });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login: ' + error.message });
    }
});

// --- Validate Token Route (for client-side verification/auto-login) ---
app.get('/validate-token', authenticateUser, (req, res) => {
    // If authenticateUser middleware passes, the token is valid
    res.status(200).json({ message: 'Token is valid', user: req.user });
});

// --- Start Test Route ---
app.get('/start-test', authenticateUser, (req, res) => {
    try {
        const shuffledQuestions = [...ALL_QUESTIONS_DATA].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffledQuestions.slice(0, NUMBER_OF_QUESTIONS_PER_TEST);
        res.status(200).json({ questions: selectedQuestions });
    } catch (error) {
        console.error('Error selecting questions:', error);
        res.status(500).json({ message: 'Failed to retrieve test questions.' });
    }
});

// --- Save Test Result Route ---
app.post('/save-test-result', authenticateUser, async (req, res) => {
    const { score, totalQuestions, isPass } = req.body;
    const { userId, username } = req.user; // Get user info from authenticated token

    if (score === undefined || totalQuestions === undefined || isPass === undefined) {
        return res.status(400).json({ message: 'Missing test result data.' });
    }

    try {
        const newAttempt = {
            TestAttemptId : uuidv4(), // Corrected key name to match DynamoDB table's primary key
            UserId: userId,
            Username: username, // Store username for easier querying/display
            Score: score,
            TotalQuestions: totalQuestions,
            IsPass: isPass,
            AttemptDate: new Date().toISOString()
        };

        await dynamodb.put({
            TableName: TEST_ATTEMPTS_TABLE_NAME,
            Item: newAttempt
        }).promise();

        res.status(201).json({ message: 'Test result saved successfully.' });
    } catch (error) {
        console.error('Error saving test result:', error);
        res.status(500).json({ message: 'Failed to save test result: ' + error.message });
    }
});

// --- Get Test History Route ---
app.get('/get-test-history', authenticateUser, async (req, res) => {
    const { userId } = req.user;

    try {
        const params = {
            TableName: TEST_ATTEMPTS_TABLE_NAME,
            IndexName: 'UserId-AttemptDate-index', // Recommended GSI for querying by UserId and sorting by AttemptDate
            KeyConditionExpression: 'UserId = :userId',
            ExpressionAttributeValues: { ':userId': userId },
            ScanIndexForward: false // To get most recent attempts first
        };
        const result = await dynamodb.query(params).promise();
        res.status(200).json({ history: result.Items || [] });
    } catch (error) {
        console.error('Error fetching test history:', error);
        res.status(500).json({ message: 'Failed to fetch test history: ' + error.message });
    }
});

app.get('/get-certificate-data', authenticateUser, async (req, res) => {
    const { userId, username, email } = req.user; // Get user info from authenticated token

    try {
        // 1. Get user details (though username and email are already in token, fetching for completeness/future expansion)
        const userParams = {
            TableName: USER_TABLE_NAME,
            Key: {
                UserId: userId // Assuming UserId is the primary key
            }
        };
        const userResult = await dynamodb.get(userParams).promise();
        const user = userResult.Item;

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // 2. Get the latest passing test attempt for this user
        const testAttemptParams = {
            TableName: TEST_ATTEMPTS_TABLE_NAME,
            IndexName: 'UserId-AttemptDate-index', // Ensure this GSI exists and is configured for UserId and AttemptDate
            KeyConditionExpression: 'UserId = :userId',
            FilterExpression: 'IsPass = :isPass', // Filter for passing attempts
            ExpressionAttributeValues: {
                ':userId': userId,
                ':isPass': true
            },
            ScanIndexForward: false, // Get the most recent attempt first
            Limit: 1 // We only need the latest one
        };

        const testAttemptResult = await dynamodb.query(testAttemptParams).promise();
        const latestPassingAttempt = testAttemptResult.Items && testAttemptResult.Items[0];

        if (!latestPassingAttempt) {
            // It's possible the user hasn't passed any test yet
            return res.status(404).json({ message: 'No passing test result found for this user.', user: { username: user.Username, email: user.Email } });
        }

        res.status(200).json({
            studentName: user.Username,
            studentEmail: user.Email,
            studentScore: latestPassingAttempt.Score,
            totalQuestions: latestPassingAttempt.TotalQuestions,
            testDate: latestPassingAttempt.AttemptDate
        });

    } catch (error) {
        console.error('Error fetching certificate data:', error);
        res.status(500).json({ message: 'Failed to fetch certificate data: ' + error.message });
    }
});



// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access frontend at http://localhost:${PORT}`);
});