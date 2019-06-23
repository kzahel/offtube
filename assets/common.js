const MUI = MaterialUI

export function parseUrlParams(url) {
  if (url.indexOf('?') === -1) return null
  return url.split('?')[1].
             split('&').
             map( part => part.split('=') ).
             reduce( (acc, kv) => ({[kv[0]]:decodeURIComponent(kv[1]),...acc}), {})
}

export function JSONView(props) {
  return <pre className="mypre">{JSON.stringify(props, null, '  ')}</pre>
}

export function HideOnScroll(props) {
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
