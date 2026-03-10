import classNames from "classnames/bind";
import styles from "./footer.module.scss";
const cx = classNames.bind(styles);

function Footer() {
  return (
    <div className={cx("wrapper")}>        
      <p className={cx("text2")}>Thank you for watching . I Hope You Like It</p>
    </div>
  );
}

export default Footer;
