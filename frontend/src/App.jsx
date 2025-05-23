import { useState, useContext, useEffect } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import Input from "./components/ui/input";
import { Label } from "./components/ui/label";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import {
  Plus,
  Bell,
  ListTodo,
  CircleCheckBig,
  Clock,
  Menu,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import AuthContext from "./context/AuthContext";
import config from "./config";
import { format } from "date-fns";
import axios from "axios";

export default function App() {
  const [view, setView] = useState("add-task");
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [notificationType, setNotificationType] = useState("email");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notificationWhatsApp, setNotificationWhatsApp] = useState("");
  const [notificationTime, setNotificationTime] = useState(10);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [tasksResponse, notificationResponse] = await Promise.all([
          axios.get(`${config.backendUrl}/api/tasks`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          axios.get(`${config.backendUrl}/api/notifications`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        setTasks(tasksResponse.data);
        if (notificationResponse.data) {
          setNotificationType(notificationResponse.data.notificationType);
          setNotificationEmail(notificationResponse.data.notificationEmail);
          setNotificationWhatsApp(
            notificationResponse.data.notificationWhatsApp
          );
          setNotificationTime(notificationResponse.data.notificationTime);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setPopupMessage("Failed to fetch user data");
        setPopupColor("red");
        setTimeout(() => setPopupMessage(""), 3000);
      }
    };
    if (isAuthenticated) fetchUserData();
  }, [isAuthenticated]);

  const saveNotificationSettings = async () => {
    try {
      await axios.post(
        `${config.backendUrl}/api/notifications`,
        {
          notificationType,
          notificationEmail,
          notificationWhatsApp,
          notificationTime,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPopupMessage("Notification settings saved!");
      setPopupColor("green");
      setTimeout(() => setPopupMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save notification settings", err);
      setPopupMessage("Failed to save notification settings");
      setPopupColor("red");
      setTimeout(() => setPopupMessage(""), 3000);
    }
  };

  const addTask = async () => {
    if (!taskTitle || !taskDescription || !taskDeadline || !taskPriority) {
      setPopupMessage("All fields are required!");
      setPopupColor("red");
      setTimeout(() => setPopupMessage(""), 3000);
      return;
    }
    try {
      const response = await axios.post(
        `${config.backendUrl}/api/tasks`,
        {
          title: taskTitle,
          description: taskDescription,
          deadline: taskDeadline,
          priority: taskPriority,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTasks([...tasks, response.data]);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDeadline("");
      setTaskPriority("");
      setPopupMessage("Task added successfully!");
      setPopupColor("green");
      setTimeout(() => setPopupMessage(""), 3000);
    } catch (err) {
      console.error("Failed to create task:", err);
      setPopupMessage("Failed to create task");
      setPopupColor("red");
      setTimeout(() => setPopupMessage(""), 3000);
    }
  };

  const saveNotification = () => {
    if (!notificationEmail && notificationType === "email") {
      setPopupMessage("Email is required!");
      setPopupColor("red");
      setTimeout(() => setPopupMessage(""), 3000);
      return;
    }
    if (!notificationWhatsApp && notificationType === "whatsapp") {
      setPopupMessage("WhatsApp number is required!");
      setPopupColor("red");
      setTimeout(() => setPopupMessage(""), 3000);
      return;
    }
    saveNotificationSettings();
  };

  const saveNotificationDetails = () => {
    if (!notificationTime) {
      setPopupMessage("Notification time is required!");
      setPopupColor("red");
      setTimeout(() => setPopupMessage(""), 3000);
      return;
    }
    saveNotificationSettings();
  };

  const handleMobileNav = (targetView) => {
    setView(targetView);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <CircleCheckBig className="h-6 w-6 text-black-500 mr-2" />
            <h1 className="text-2xl font-bold text-black-500">Task Tick</h1>
          </div>
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-lg z-30 p-4 md:hidden"
        >
          <div className="flex flex-col space-y-4 mt-10">
            <Button
              variant="outline"
              onClick={() => handleMobileNav("add-task")}
            >
              <Plus className="h-5 w-5 mr-2" /> Add Task
            </Button>
            <Button
              variant="outline"
              onClick={() => handleMobileNav("view-tasks")}
            >
              <ListTodo className="h-5 w-5 mr-2" /> View All Tasks
            </Button>
            <Button
              variant="outline"
              onClick={() => handleMobileNav("notification-type")}
            >
              <Bell className="h-5 w-5 mr-2" /> Notification Type
            </Button>
            <Button
              variant="outline"
              onClick={() => handleMobileNav("notify-details")}
            >
              <Clock className="h-5 w-5 mr-2" /> Notification Duration
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-grow flex overflow-hidden container mx-auto px-4 py-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-[23.5%] pr-5 sticky top-4 self-start">
          <div className="flex flex-col space-y-4">
            <Button
              variant="outline"
              onClick={() => setView("add-task")}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Plus className="h-6 w-6" /> <span>Add Task</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setView("view-tasks")}
              className="w-full flex items-center justify-center space-x-2"
            >
              <ListTodo className="h-6 w-6" /> <span>View All Tasks</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setView("notification-type")}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Bell className="h-6 w-6" /> <span>Notification Type</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setView("notify-details")}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Clock className="h-6 w-6" /> <span>Notification Duration</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full md:w-3/4 h-full overflow-y-auto space-y-8">
          {view === "add-task" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Add Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="text-sm font-medium">
                      Deadline
                    </Label>
                    <Input
                      id="deadline"
                      type="datetime-local"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priority
                    </Label>
                    <Select
                      onValueChange={(value) => setTaskPriority(value)}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={addTask} className="w-full">
                    Add Task
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {view === "view-tasks" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {tasks.map((task, index) => {
                const d = new Date(task.deadline);
                const valid = !isNaN(d);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white shadow-md rounded-lg p-4"
                  >
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">
                        {task.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 ">
                        {" "}
                        <span className="font-bold">Description:</span>
                        {task.description}
                      </p>
                      <p className="text-gray-600">
                        {" "}
                        <span className="font-bold">Notify Type:</span>{" "}
                        {notificationType}
                      </p>
                      {notificationType === "email" && (
                        <p className="text-gray-600">
                          {" "}
                          <span className="font-bold">Email: </span>
                          {notificationEmail}
                        </p>
                      )}
                      {notificationType === "whatsapp" && (
                        <p className="text-gray-600">
                          {" "}
                          <span className="font-bold">WhatsApp: </span>
                          {notificationWhatsApp}
                        </p>
                      )}
                      <p className="text-gray-600">
                        {" "}
                        <span className="font-bold">Deadline: </span>
                        {valid ? format(d, "hh:mm a dd/MM/yy") : "Invalid date"}
                      </p>
                      <p className="text-gray-600">
                        {" "}
                        <span className="font-bold">Timer: </span>
                        {notificationTime} minutes before deadline
                      </p>
                      <p className="text-gray-600">
                        {" "}
                        <span className="font-bold">Priority:</span>{" "}
                        {task.priority}
                      </p>
                    </CardContent>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {view === "notification-type" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    Notification Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    defaultValue={notificationType}
                    onValueChange={(val) => setNotificationType(val)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="whatsapp" id="whatsapp" />
                      <Label htmlFor="whatsapp" className="text-sm font-medium">
                        WhatsApp
                      </Label>
                    </div>
                  </RadioGroup>
                  {notificationType === "email" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="emailAddr"
                        className="text-sm font-medium"
                      >
                        Email address
                      </Label>
                      <Input
                        id="emailAddr"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                  )}
                  {notificationType === "whatsapp" && (
                    <div className="space-y-2">
                      <Label htmlFor="whNum" className="text-sm font-medium">
                        WhatsApp number
                      </Label>
                      <Input
                        id="whNum"
                        value={notificationWhatsApp}
                        onChange={(e) =>
                          setNotificationWhatsApp(e.target.value)
                        }
                        className="w-full"
                        required
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={saveNotification} className="w-full">
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {view === "notify-details" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    Notification Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium">
                      Time (in minutes)
                    </Label>
                    <Input
                      id="time"
                      type="number"
                      value={notificationTime}
                      onChange={(e) => setNotificationTime(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={saveNotificationDetails} className="w-full">
                    Save Notification Details
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      {/* Popup Alerts */}
      {popupMessage && (
        <div
          className={`${
            popupColor === "green" ? "bg-green-600" : "bg-red-600"
          } fixed bottom-10 left-1/2 transform -translate-x-1/2 p-4 rounded-md text-white`}
        >
          {popupMessage}
        </div>
      )}
    </div>
  );
}
