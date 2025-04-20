# **Task Tick** ⏰  

### **Your Smart Task Management Companion**  
**Task Tick** is more than just a to-do list app—it’s your personal task assistant. Built with the robust **MERN Stack**, **Task Tick** empowers you to organize tasks, set deadlines, and receive timely reminders via **Email** or **WhatsApp**. Stay ahead of your schedule and never miss a deadline again!  

---

**[Live link](https://task-tick-app.vercel.app/)** 

---

## **Currently in Working State !** 

---

## **Key Features** ✨  
- **Task Management Made Easy:**  
  Perform seamless **Create**, **Read**, **Update**, and **Delete** (CRUD) operations for your tasks.  

- **Personalized Notifications:**  
  Get reminders through your preferred medium—**Email** or **WhatsApp**.  

- **Deadline Management:**  
  Assign specific deadlines to tasks, including both **date** and **time**, ensuring precise time management.  

- **Customizable Reminders:**  
  Decide how far in advance you want to be reminded of your task deadlines.  

- **Modern UI:**  
  A clean and user-friendly interface designed for effortless navigation.  

---

## **Tech Stack** 🛠️  
- **Frontend:** React.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Notifications:** Integration with WhatsApp and Email APIs  

---

## **How It Works** 📋  
1. **Create a Task:**  
   Add tasks with relevant details such as title, description, deadline date, and time.  

2. **Set Notification Preferences:**  
   Choose whether you want reminders via **Email** or **WhatsApp**, and specify how early you'd like to be notified.  

3. **Receive Timely Alerts:**  
   Never miss a deadline! Notifications will be sent according to your preferences.  

4. **Manage Tasks:**  
   Update or delete tasks as your priorities change.  

---

## **Installation and Setup** ⚙️  

### Prerequisites:  
- Node.js installed on your system  
- MongoDB database  

### Steps:  
1. **Clone the Repository:**  
   ```bash  
   git clone https://github.com/yourusername/tick-task.git  
   cd tick-task  
   ```  

2. **Install Dependencies:**  
   ```bash  
   npm install  
   cd client  
   npm install  
   cd ..  
   ```  

3. **Set Up Environment Variables:**  
   Create a `.env` file in the backend root directory as `.env.example` with the following keys:  
   ```env  
   MONGO_URI=<your-mongodb-connection-string>  
   EMAIL_API_KEY=<your-email-api-key>  
   WHATSAPP_API_KEY=<your-whatsapp-api-key>  
   PORT=5000  
   ```  

4. **Configure Backend URL:**  
   In frontend folder open config file and replace `backendURL` with your backend url:
   ```bash  
   const config = {
   backendUrl: 'http://localhost:5000',
   }; 
   export default config;
   ```  
   This means your backend is running on 5000 port.  

---
5. **Run the Application:**  
   ```bash  
   npm run dev  
   ```  
   The app will be available at `http://localhost:3000`.  

---


## **Future Enhancements** 🚀  
- Add support for SMS notifications.  
- Advanced analytics for task completion trends.  
- Integration with popular calendar apps.  

---

## **Contributing** 🤝  
We welcome contributions! Follow these steps to contribute:  
1. Fork the repository.  
2. Create a new branch (`git checkout -b feature-name`).  
3. Commit your changes (`git commit -m "Added feature"`).  
4. Push the branch (`git push origin feature-name`).  
5. Create a Pull Request.  

---

## **Connect With Us** 🌐  
- **GitHub:** [Your Profile](https://github.com/exclusiveabhi)  

--- 

### **Don't Let Deadlines Tick Away! Try Task Tick Today!**  