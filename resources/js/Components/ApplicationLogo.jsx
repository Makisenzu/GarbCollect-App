import appLogo from '@/images/app-logo.png';
export default function ApplicationLogo(props) {
    return (
        <img
        src={appLogo}
        alt="App Logo"
        className={props.className || "h-20 w-auto"}
      />
    );
}
