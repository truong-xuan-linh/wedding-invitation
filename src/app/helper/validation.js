export default function validation({ name, wish, isAttend }) {
  if (name.trim() === "") {
    return {
      isValid: false,
      message: "Vui lòng cho chúng tôi biết tên hoặc nickname của bạn!",
    };
  }
  if (name.trim().length > 30) {
    return {
      isValid: false,
      message: "Vui lòng nhập tên của bạn dưới 30 ký tự.",
    };
  }
  if (wish.trim() === "") {
    return { isValid: false, message: "Vui lòng nhập lời chúc của bạn!" };
  }
  if (isAttend === null) {
    return {
      isValid: false,
      message: "Hãy cho chúng tôi biết bạn có đến tham dự hay không!",
    };
  }
  return { isValid: true, message: "" };
}
