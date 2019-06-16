var {Icon, Button, Menu, MenuItem} = MaterialUI;

function SimpleMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const actions = Object.entries(props.actions).map( ([text,fn]) => {
    return <MenuItem key={text}
                     onClick={(e) => { fn(e); handleClose(e) }}
      >{text}</MenuItem>;
  })
  
  return (
    <div>
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        {props.value || ''}<Icon>more_vert</Icon>
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {actions}
      </Menu>
    </div>
  );
}
