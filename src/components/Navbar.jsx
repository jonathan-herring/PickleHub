// import { Link } from "react-router-dom";
import { Toolbar, Typography, Button } from "@mui/material";
import AppBar from "@mui/material/AppBar";

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          PickleHub
        </Typography>
        <Button color="inherit">Create New Post</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
