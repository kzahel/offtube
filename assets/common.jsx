function JSONView(props) {
  return <pre className="mypre">{JSON.stringify(props, null, '  ')}</pre>
}

function HideOnScroll(props) {
  const { children } = props;
  const trigger = MaterialUI.useScrollTrigger();

  return (
    <MUI.Slide appear={false} direction="down" in={!trigger}>
    {children}
    </MUI.Slide>
  );
}

HideOnScroll.propTypes = {
  children: PropTypes.node.isRequired,
};
