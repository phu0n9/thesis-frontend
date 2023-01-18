import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import Rows from "./Keywords";
import { useKeywords } from "./App";
import Button from '@mui/material/Button';

export default function RightBarNavigation(props: any) {
  const { toggleDrawer, state } = props;
  const {handleBackOnClick, current} = useKeywords();

  const list = () => (
    <Box
      sx={{ width: 500 }}
      role="presentation"
      // onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {current > 1 && <Button onClick={() => handleBackOnClick()} variant="contained" style={{margin: 20}}>Back</Button>}
      <div style={{ marginLeft: 15 }}>
        <Rows />
      </div>
    </Box>
  );

  return (
    <div>
      <React.Fragment>
        <MenuIcon />
        <Drawer anchor={"right"} open={state} onClose={toggleDrawer(false)}>
          {list()}
        </Drawer>
      </React.Fragment>
    </div>
  );
}
