const express = require('express');
const fs = require('fs');
const users = require("./MOCK_DATA.json");
const app = express();

const PORT = 3000;
//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // to handle JSON bodies

// routes
app.get("/api/users", (req, res) => {
  return res.json(users);
});

app.get("/users", (req, res) => {
  const html = `
    <ul>
      ${users.map((user) => '<li>${user.title}</li>').join('')}
    </ul>`;
  res.send(html);
});

app.route('/api/users/:id')
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id === id);
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  })
  .patch((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);
    
    if (userIndex !== -1) {
      const updatedUser = { ...users[userIndex], ...req.body }; // merging existing user with incoming data
      users[userIndex] = updatedUser;

      fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating user' });
        }
        return res.json({ status: 'success', user: updatedUser });
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex((user) => user.id === id);

    if (userIndex !== -1) {
      users.splice(userIndex, 1); // Remove the user from the array

      fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error deleting user' });
        }
        return res.json({ status: 'success', message: 'User deleted' });
      });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  });

app.post("/api/users", (req, res) => {
  const body = req.body;
  const newUser = {id: users.length + 1, ...body };
  users.push(newUser);

  fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error adding user' });
    }
    return res.json({ status: 'success', id: newUser.id });
  });
});

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));