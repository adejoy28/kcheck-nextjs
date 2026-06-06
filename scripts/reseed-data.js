// import 'dotenv/config'
// import mysql from 'mysql2/promise'
// import bcrypt from 'bcryptjs'

// async function reseedData() {
//     let connection;
    
//     try {
//         console.log('Starting MySQL database reseeding...')
        
//         // Create connection
//         connection = await mysql.createConnection({
//             host: process.env.DB_HOST || 'localhost',
//             port: process.env.DB_PORT || 3306,
//             user: process.env.DB_USER || 'root',
//             password: process.env.DB_PASSWORD || '',
//             database: process.env.DB_NAME || 'kcheck',
//             ssl: {
//                 rejectUnauthorized: true
//             }
//         })
        
//         console.log('Database connection verified')

//         // Clear existing data (in order of dependencies)
//         console.log('Clearing existing data...')
//         await connection.execute('DELETE FROM batch_members')
//         await connection.execute('DELETE FROM batch_teams')
//         await connection.execute('DELETE FROM batches')
//         await connection.execute('DELETE FROM questions')
//         await connection.execute('DELETE FROM exams')
//         await connection.execute('DELETE FROM users')
//         await connection.execute('DELETE FROM categories')
//         await connection.execute('DELETE FROM teams')
//         console.log('Existing data cleared')

//         // Insert teams (matching seed.ts exactly)
//         console.log('Inserting teams...')
//         await connection.execute(`
//             INSERT INTO teams (id, name, unit, created_at) VALUES
//             (1, 'Prepaid Call Center', 'Customer Care', NOW()),
//             (2, 'Postpaid Call Center', 'Customer Care', NOW()),
//             (3, 'Technical Support', 'Network Operations', NOW())
//         `)

//         // Insert categories (matching seed.ts exactly)
//         console.log('Inserting categories...')
//         await connection.execute(`
//             INSERT INTO categories (id, name, created_at) VALUES
//             (1, 'Compliance', NOW()),
//             (2, 'Product Knowledge', NOW()),
//             (3, 'Customer Service', NOW())
//         `)

//         // Insert users with hashed passwords (matching seed.ts exactly)
//         console.log('Inserting users...')
//         const adminPassword = await bcrypt.hash('admin123', 12)
//         const staffPassword = await bcrypt.hash('staff123', 12)
        
//         await connection.execute(`
//             INSERT INTO users (id, name, username, password, role, phone, unit, access_group, team_id, created_at) VALUES
//             (1, 'Admin User', 'admin', ?, 'ADMIN', NULL, NULL, 'Administrator', NULL, NOW()),
//             (2, 'John Adebayo', 'JA254510', ?, 'STAFF', '08012345678', 'Customer Care', 'Team Member', 1, NOW()),
//             (3, 'Alice Smith', 'AS332213', ?, 'STAFF', '08087654321', 'Customer Care', 'Team Member', 2, NOW()),
//             (4, 'Bob Jones', 'BJ435336', ?, 'STAFF', '08055566677', 'Network Operations', 'Team Member', 3, NOW())
//         `, [adminPassword, staffPassword, staffPassword, staffPassword])

//         // Insert exams (matching seed.ts exactly)
//         console.log('Inserting exams...')
//         await connection.execute(`
//             INSERT INTO exams (id, title, description, duration, passing_score, is_active, category_id, created_by_id, created_at) VALUES
//             (1, 'Demo Test', 'A sample test for users to try out the system', 10, 80, 1, 1, 1, NOW()),
//             (2, 'Customer Care Fundamentals', 'Basic knowledge check for all customer care staff', 30, 60, 1, 3, 1, NOW()),
//             (3, 'Prepaid Products Knowledge', 'Product knowledge test for prepaid call center staff', 45, 70, 1, 2, 1, NOW()),
//             (4, 'Sales and Upselling Techniques', 'Advanced sales skills and product upselling for CCRs', 40, 65, 1, 2, 1, NOW()),
//             (5, 'Technical Troubleshooting', 'Common technical issues and solutions for Glo services', 35, 70, 1, 1, 1, NOW()),
//             (6, 'Compliance and Regulations', 'Regulatory compliance and legal requirements for customer service', 25, 75, 1, 1, 1, NOW())
//         `)

//         // Insert questions (matching seed.ts exactly)
//         console.log('Inserting questions...')
        
//         // Demo Test questions (CCR-related)
//         await connection.execute(`
//             INSERT INTO questions (id, exam_id, text, options, correct_answer, weight, created_at) VALUES
//             (1, 1, 'What is the first thing you should say when answering a call?', 
//              '["Thank you for calling Globacom", "Hello", "Your name", "How can I help?"]', 0, 1, NOW()),
//             (2, 1, 'Which tone should you use when speaking to customers?', 
//              '["Professional and friendly", "Casual", "Formal and strict", "Loud and clear"]', 0, 1, NOW()),
//             (3, 1, 'What should you do before providing account information?', 
//              '["Verify customer identity", "Check balance first", "Transfer to supervisor", "Ask for payment"]', 0, 1, NOW()),
//             (4, 1, 'How should you handle an irate customer?', 
//              '["Stay calm and listen", "Transfer immediately", "Hang up", "Argue back"]', 0, 1, NOW()),
//             (5, 1, 'What is the maximum time to keep a customer on hold?', 
//              '["2 minutes", "5 minutes", "10 minutes", "No limit"]', 0, 1, NOW()),
//             (6, 1, 'Which information is most important to verify customer identity?', 
//              '["Phone number and name", "Address only", "Email only", "Date of birth"]', 0, 1, NOW()),
//             (7, 1, 'What should you say when putting a customer on hold?', 
//              '["May I put you on hold for a moment?", "Hold please", "Wait", "One second"]', 0, 1, NOW()),
//             (8, 1, 'How should you end a customer service call?', 
//              '["Ask if there\\'s anything else and thank them", "Just hang up", "Say goodbye quickly", "Transfer to survey"]', 0, 1, NOW()),
//             (9, 1, 'What is the Glo customer service number?', 
//              '["121", "200", "555", "777"]', 0, 1, NOW()),
//             (10, 1, 'Which of these shows active listening?', 
//              '["Repeating what customer said", "Interrupting frequently", "Taking notes silently", "Looking at computer"]', 0, 1, NOW()),
//             (31, 1, 'What should you do if you don\\'t know the answer to a customer\\'s question?', 
//              '["Say you\\'ll find out and get back to them", "Guess the answer", "Transfer immediately", "Tell them you don\\'t know"]', 0, 1, NOW()),
//             (32, 1, 'How should you handle multiple customers waiting?', 
//              '["Acknowledge wait times and set expectations", "Help the loudest customer first", "Ignore waiting customers", "Work as fast as possible"]', 0, 1, NOW()),
//             (33, 1, 'What is the most important skill for a CCR?', 
//              '["Communication", "Technical knowledge", "Sales ability", "Computer skills"]', 0, 1, NOW()),
//             (34, 1, 'When should you escalate a call to supervisor?', 
//              '["When customer requests supervisor or issue is beyond authority", "Never", "When you\\'re tired of the customer", "For every complaint"]', 0, 1, NOW()),
//             (35, 1, 'What information should you document after each call?', 
//              '["Customer issue, resolution, and follow-up needed", "Only customer name", "Only call duration", "Nothing unless required"]', 0, 1, NOW())
//         `)

//         // Customer Care Fundamentals questions
//         await connection.execute(`
//             INSERT INTO questions (id, exam_id, text, options, correct_answer, weight, created_at) VALUES
//             (11, 2, 'What is the standard greeting for inbound calls?', 
//              '["Hello, how can I help?", "Thank you for calling Globacom, my name is [Name], how may I assist you?", "Globacom, speak.", "Yes, what do you want?"]', 1, 1, NOW()),
//             (12, 2, 'What should you do when a customer is angry?', 
//              '["Hang up immediately", "Argue back to defend the company", "Stay calm, listen actively, and empathise", "Transfer the call without explanation"]', 2, 1, NOW()),
//             (13, 2, 'What is the maximum hold time before checking back with a customer?', 
//              '["5 minutes", "2 minutes", "10 minutes", "No limit"]', 1, 1, NOW()),
//             (14, 2, 'Which of these is NOT a core value of Globacom?', 
//              '["Integrity", "Excellence", "Indifference", "Innovation"]', 2, 1, NOW()),
//             (15, 2, 'How should you end a customer call?', 
//              '["Just hang up when done", "Ask if there is anything else, thank the customer, and close politely", "Tell the customer to call back if they have issues", "Transfer to supervisor"]', 1, 1, NOW()),
//             (16, 2, 'What information should you verify before discussing account details?', 
//              '["Customer name and phone number", "Customer address only", "Customer email only", "No verification needed"]', 0, 1, NOW()),
//             (17, 2, 'How should you handle a call that you cannot resolve?', 
//              '["Transfer to supervisor with proper explanation", "Tell customer to call back", "Hang up and hope they call again", "Promise to call back without timeline"]', 0, 1, NOW()),
//             (18, 2, 'What is the proper way to put a customer on hold?', 
//              '["Ask permission and explain reason", "Just press hold button", "Tell them to wait", "Put them on hold without warning"]', 0, 1, NOW()),
//             (19, 2, 'Which of these is essential for good customer service?', 
//              '["Active listening", "Speaking quickly", "Using technical jargon", "Avoiding eye contact"]', 0, 1, NOW()),
//             (20, 2, 'What should you do if you make a mistake?', 
//              '["Admit it and apologize sincerely", "Blame the system", "Ignore it and hope customer doesn\\'t notice", "Transfer to someone else"]', 0, 1, NOW()),
//             (36, 2, 'How should you respond when a customer says "I want to speak to your manager"?', 
//              '["I\\'d be happy to transfer you, may I ask what this is about so I can better assist?", "Transfer immediately", "Ask why they want to speak to manager", "Tell them manager is busy"]', 0, 1, NOW()),
//             (37, 2, 'What is empathy in customer service?', 
//              '["Understanding and sharing the customer\\'s feelings", "Feeling sorry for the customer", "Agreeing with everything customer says", "Giving discounts to upset customers"]', 0, 1, NOW()),
//             (38, 2, 'Which phrase shows excellent customer service?', 
//              '["I understand your frustration and I\\'m here to help", "That\\'s not my department", "You should have called earlier", "What do you want now?"]', 0, 1, NOW()),
//             (39, 2, 'How should you handle confidential customer information?', 
//              '["Keep it secure and only share with authorized personnel", "Share with colleagues for help", "Write it down for reference", "Discuss with other customers"]', 0, 1, NOW()),
//             (40, 2, 'What is the best way to handle a long queue of customers?', 
//              '["Acknowledge the wait and work efficiently", "Rush through each call", "Take breaks between calls", "Ignore the queue"]', 0, 1, NOW())
//         `)

//         // Prepaid Products Knowledge questions
//         await connection.execute(`
//             INSERT INTO questions (id, exam_id, text, options, correct_answer, weight, created_at) VALUES
//             (21, 3, 'What is the validity period of the Glo Daily Plan?', 
//              '["24 hours", "48 hours", "72 hours", "7 days"]', 0, 1, NOW()),
//             (22, 3, 'Which code is used to check Glo account balance?', 
//              '["*124#", "*131#", "*777#", "*200#"]', 0, 1, NOW()),
//             (23, 3, 'What is the minimum recharge amount on the Glo network?', 
//              '["50", "100", "200", "500"]', 0, 1, NOW()),
//             (24, 3, 'Which Glo plan offers unlimited data for 30 days?', 
//              '["Glo Unlimited", "Glo Daily", "Glo Weekly", "Glo Monthly"]', 0, 1, NOW()),
//             (25, 3, 'What is the code to borrow airtime on Glo?', 
//              '["*303#", "*505#", "*777#", "*123#"]', 1, 1, NOW()),
//             (26, 3, 'Which of these is a Glo data bundle?', 
//              '["Glo Berekete", "Glo Yakata", "Glo Infinito", "All of the above"]', 3, 1, NOW()),
//             (27, 3, 'What is the Glo customer care number?', 
//              '["121", "200", "555", "777"]', 0, 1, NOW()),
//             (28, 3, 'Which code is used to migrate to Glo Yakata tariff?', 
//              '["*227#", "*303#", "*100#", "*200#"]', 2, 1, NOW()),
//             (29, 3, 'What is the validity period of a typical Glo weekly data plan?', 
//              '["3 days", "7 days", "14 days", "30 days"]', 1, 1, NOW()),
//             (30, 3, 'Which service allows Glo customers to share data?', 
//              '["Glo Share", "Glo Transfer", "Glo Gift", "Glo Data Share"]', 3, 1, NOW()),
//             (41, 3, 'What is the code to check Glo data balance?', 
//              '["*127#", "*124#", "*777#", "*200#"]', 0, 1, NOW()),
//             (42, 3, 'Which Glo tariff plan offers the cheapest call rates?', 
//              '["Glo Yakata", "Glo Berekete", "Glo Infinito", "Glo Classic"]', 0, 1, NOW()),
//             (43, 3, 'What is the validity period of Glo monthly data plans?', 
//              '["30 days", "7 days", "14 days", "90 days"]', 0, 1, NOW()),
//             (44, 3, 'Which code is used to buy Glo data bundles?', 
//              '["*777#", "*124#", "*131#", "*200#"]', 0, 1, NOW()),
//             (45, 3, 'What is the maximum amount of data you can borrow on Glo?', 
//              '["100MB", "500MB", "1GB", "2GB"]', 0, 1, NOW())
//         `)

//         // Sales and Upselling Techniques questions
//         await connection.execute(`
//             INSERT INTO questions (id, exam_id, text, options, correct_answer, weight, created_at) VALUES
//             (46, 4, 'What is the best time to suggest an additional product to a customer?', 
//              '["After resolving their primary issue", "At the beginning of the call", "Before understanding their needs", "Never"]', 0, 1, NOW()),
//             (47, 4, 'How should you approach upselling to an angry customer?', 
//              '["Focus on resolving their issue first", "Immediately offer premium products", "Ignore their anger and sell", "Transfer to sales team"]', 0, 1, NOW()),
//             (48, 4, 'What is cross-selling?', 
//              '["Selling related but different products", "Selling more of the same product", "Selling expensive products", "Giving discounts"]', 0, 1, NOW()),
//             (49, 4, 'Which question helps identify customer needs?', 
//              '["What do you use your phone for most?", "Do you want to buy something?", "Can I help you?", "Are you happy with our service?"]', 0, 1, NOW()),
//             (50, 4, 'What is the most effective way to present a product benefit?', 
//              '["Focus on how it solves their specific problem", "List all features", "Mention the price first", "Use technical terms"]', 0, 1, NOW()),
//             (51, 4, 'How should you handle price objections?', 
//              '["Acknowledge concern and explain value", "Immediately offer discount", "Defend the price", "End the conversation"]', 0, 1, NOW()),
//             (52, 4, 'What is a trial close?', 
//              '["Asking questions to gauge buying interest", "Offering a free trial", "Closing the sale quickly", "Giving up on the sale"]', 0, 1, NOW()),
//             (53, 4, 'Which Glo data plan is best for heavy internet users?', 
//              '["Glo Unlimited", "Glo Daily", "Glo Weekly", "Glo Yakata"]', 0, 1, NOW()),
//             (54, 4, 'What should you do if customer says "I need to think about it"?', 
//              '["Ask what specific concerns they have", "Say okay and hang up", "Pressure them to decide now", "Transfer to supervisor"]', 0, 1, NOW()),
//             (55, 4, 'How do you identify upselling opportunities?', 
//              '["Listen for customer pain points and needs", "Assume everyone wants more", "Offer everything to everyone", "Wait for customer to ask"]', 0, 1, NOW()),
//             (56, 4, 'What is the difference between upselling and cross-selling?', 
//              '["Upselling = better version, Cross-selling = different product", "They are the same", "Upselling = cheaper, Cross-selling = expensive", "No difference"]', 0, 1, NOW()),
//             (57, 4, 'When should you mention price during a sales conversation?', 
//              '["After establishing value and benefits", "First thing in conversation", "Never mention price", "Only if customer asks"]', 0, 1, NOW()),
//             (58, 4, 'What is the best response to "Your prices are too high"?', 
//              '["I understand your concern, let me show you the value you\\'ll receive", "Sorry, I can\\'t help", "Those are our fixed prices", "Let me give you a discount"]', 0, 1, NOW()),
//             (59, 4, 'How do you build rapport before selling?', 
//              '["Show genuine interest in their needs", "Jump straight to sales pitch", "Talk about yourself", "Use sales jargon"]', 0, 1, NOW()),
//             (60, 4, 'What is the most important factor in successful upselling?', 
//              '["Customer trust and relationship", "Product knowledge", "Sales techniques", "Discount offers"]', 0, 1, NOW())
//         `)

//         // Technical Troubleshooting questions
//         await connection.execute(`
//             INSERT INTO questions (id, exam_id, text, options, correct_answer, weight, created_at) VALUES
//             (61, 5, 'What is the first step in troubleshooting a connectivity issue?', 
//              '["Ask customer to restart their device", "Check network status", "Transfer to technical team", "Assume it\\'s a network problem"]', 0, 1, NOW()),
//             (62, 5, 'Which code helps customers check their Glo data balance?', 
//              '["*127#", "*124#", "*777#", "*200#"]', 0, 1, NOW()),
//             (63, 5, 'What should you do if customer cannot make calls?', 
//              '["Check if they have sufficient airtime and signal", "Tell them to buy airtime", "Transfer immediately", "Restart their phone for them"]', 0, 1, NOW()),
//             (64, 5, 'How do customers activate Glo data bundles?', 
//              '["Dial *777# and follow prompts", "Call customer care", "Visit Glo office", "Send SMS"]', 0, 1, NOW()),
//             (65, 5, 'What is the most common cause of slow data speed?', 
//              '["Insufficient data balance", "Network congestion", "Phone problems", "Weather"]', 0, 1, NOW()),
//             (66, 5, 'Which code helps customers migrate to a new tariff plan?', 
//              '["*100#", "*777#", "*124#", "*200#"]', 0, 1, NOW()),
//             (67, 5, 'What should you ask if customer reports "no signal"?', 
//              '["Location and recent changes", "Phone model only", "How much they spend", "Their name"]', 0, 1, NOW()),
//             (68, 5, 'How do customers borrow airtime on Glo?', 
//              '["Dial *303#", "Call customer care", "Visit Glo office", "Use mobile app"]', 0, 1, NOW()),
//             (69, 5, 'What is the solution for "SIM not registered" error?', 
//              '["Restart phone and check SIM registration", "Buy new SIM", "Wait 24 hours", "Contact NCC"]', 0, 1, NOW()),
//             (70, 5, 'Which code shows customer\\'s phone number?', 
//              '["*135#", "*124#", "*777#", "*100#"]', 0, 1, NOW()),
//             (71, 5, 'What causes "call ended" issues frequently?', 
//              '["Insufficient airtime or network issues", "Phone is broken", "Customer is blocking calls", "Wrong number"]', 0, 1, NOW()),
//             (72, 5, 'How do customers check their Glo account balance?', 
//              '["Dial *124#", "Call customer care", "Check app only", "Visit office"]', 0, 1, NOW()),
//             (73, 5, 'What is the first thing to check for data connection issues?', 
//              '["Data balance and network coverage", "Phone settings only", "Weather conditions", "Time of day"]', 0, 1, NOW()),
//             (74, 5, 'Which code helps customers block unwanted calls?', 
//              '["*131#", "*124#", "*777#", "*200#"]', 0, 1, NOW()),
//             (75, 5, 'What should you do if basic troubleshooting fails?', 
//              '["Escalate to technical support team", "Tell customer to buy new phone", "Give up", "Transfer to sales"]', 0, 1, NOW())
//         `)

//         // Compliance and Regulations questions
//         await connection.execute(`
//             INSERT INTO questions (id, exam_id, text, options, correct_answer, weight, created_at) VALUES
//             (76, 6, 'What is the primary purpose of customer data protection?', 
//              '["To safeguard customer privacy and prevent misuse", "To increase sales", "To improve call quality", "To reduce costs"]', 0, 1, NOW()),
//             (77, 6, 'How long should customer call recordings be kept according to Nigerian regulations?', 
//              '["Minimum 6 months", "1 month", "2 years", "Indefinitely"]', 0, 1, NOW()),
//             (78, 6, 'What information should never be shared with third parties?', 
//              '["Customer personal and financial information", "General product information", "Company location", "Working hours"]', 0, 1, NOW()),
//             (79, 6, 'What is the first step when handling a customer complaint?', 
//              '["Acknowledge receipt and log the complaint", "Transfer to supervisor", "Ignore if minor", "Offer compensation immediately"]', 0, 1, NOW()),
//             (80, 6, 'Which regulatory body oversees telecommunications in Nigeria?', 
//              '["NCC (Nigerian Communications Commission)", "CBN", "SEC", "FIRS"]', 0, 1, NOW()),
//             (81, 6, 'What should you do if customer requests call recording deletion?', 
//              '["Follow company data retention policy", "Delete immediately", "Refuse request", "Transfer to legal"]', 0, 1, NOW()),
//             (82, 6, 'What is considered confidential customer information?', 
//              '["All personal details, account info, and call records", "Only financial information", "Only phone numbers", "Nothing is confidential"]', 0, 1, NOW()),
//             (83, 6, 'How should you handle suspected fraud on customer account?', 
//              '["Report immediately to fraud department and secure account", "Ignore it", "Handle yourself", "Tell customer to visit office"]', 0, 1, NOW()),
//             (84, 6, 'What is the purpose of call quality monitoring?', 
//              '["Ensure compliance and service quality", "Punish agents", "Increase call duration", "Reduce customer calls"]', 0, 1, NOW()),
//             (85, 6, 'Which information can be shared during customer verification?', 
//              '["Only what customer provides and is necessary", "All company information", "Other customers\\' details", "Personal opinions"]', 0, 1, NOW()),
//             (86, 6, 'What should you do if customer asks for another customer\\'s information?', 
//              '["Politely refuse and explain privacy policy", "Provide if they know each other", "Share basic information", "Transfer to supervisor"]', 0, 1, NOW()),
//             (87, 6, 'How often should compliance training be conducted?', 
//              '["Regularly as required by company and regulators", "Once a year", "Never", "Only when problems occur"]', 0, 1, NOW()),
//             (88, 6, 'What is the penalty for breaching customer confidentiality?', 
//              '["Disciplinary action and possible legal consequences", "Warning only", "No penalty", "Bonus reduction"]', 0, 1, NOW()),
//             (89, 6, 'Which documents must be maintained for compliance?', 
//              '["Call logs, customer complaints, and training records", "Only sales records", "Only financial reports", "No documentation needed"]', 0, 1, NOW()),
//             (90, 6, 'What should you do if unsure about compliance requirements?', 
//              '["Ask supervisor or compliance department", "Guess", "Ignore the requirement", "Proceed anyway"]', 0, 1, NOW())
//         `)

//         // Insert batches (matching seed.ts exactly)
//         console.log('Inserting batches...')
//         const now = new Date()
//         const startDate = now.toISOString().split('T')[0]
//         const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
//         const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

//         await connection.execute(
//             'INSERT INTO batches (id, name, start_date, end_date, is_active, exam_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
//             [1, 'January 2025 - Customer Care Fundamentals', pastDate, endDate, 1, 2]
//         )
//         await connection.execute(
//             'INSERT INTO batches (id, name, start_date, end_date, is_active, exam_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
//             [2, 'January 2025 - Prepaid Products', pastDate, endDate, 1, 3]
//         )
//         await connection.execute(
//             'INSERT INTO batches (id, name, start_date, end_date, is_active, exam_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
//             [3, 'February 2025 - Customer Care Fundamentals', pastDate, endDate, 1, 2]
//         )
//         await connection.execute(
//             'INSERT INTO batches (id, name, start_date, end_date, is_active, exam_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
//             [4, 'February 2025 - Prepaid Products', pastDate, endDate, 1, 3]
//         )
//         await connection.execute(
//             'INSERT INTO batches (id, name, start_date, end_date, is_active, exam_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
//             [5, 'March 2025 - Customer Care Fundamentals', pastDate, endDate, 1, 2]
//         )
//         await connection.execute(
//             'INSERT INTO batches (id, name, start_date, end_date, is_active, exam_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
//             [6, 'March 2025 - Prepaid Products', pastDate, endDate, 1, 3]
//         )
//         await connection.execute(
//             'INSERT INTO batches (id, name, start_date, end_date, is_active, exam_id, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
//             [7, 'December 2024 - Customer Care Fundamentals', '2024-12-01', '2024-12-31', 0, 2]
//         )

//         // Add users to batches (updated for monthly schedule)
//         console.log('Adding users to batches...')
//         await connection.execute(`
//             INSERT INTO batch_members (batch_id, user_id) VALUES
//             (1, 2), (1, 3),
//             (2, 2), (2, 3),
//             (3, 2), (3, 4),
//             (4, 2), (4, 4),
//             (5, 2), (5, 3),
//             (6, 2), (6, 3),
//             (7, 4)
//         `)

//         // Add teams to batches (updated for monthly schedule)
//         await connection.execute(`
//             INSERT INTO batch_teams (batch_id, team_id) VALUES
//             (1, 1),
//             (2, 1),
//             (3, 1),
//             (4, 1),
//             (5, 1),
//             (6, 1),
//             (7, 3)
//         `)

//         console.log('Database reseeding completed successfully!')
//         console.log('')
//         console.log('Seed complete. Test accounts:')
//         console.log('  Admin   -> username: admin   password: admin123')
//         console.log('  Staff 1 -> username: JA254510    password: staff123')
//         console.log('  Staff 2 -> username: AS332213  password: staff123')
//         console.log('  Staff 3 -> username: BJ435336  password: staff123')

//     } catch (error) {
//         console.error('Error reseeding database:', error)
//         throw error
//     } finally {
//         if (connection) {
//             await connection.end()
//         }
//     }
// }

// // Run the reseeding
// reseedData().catch(console.error)
