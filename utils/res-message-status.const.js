const MESSAGE = {
  UPDATE_SUCCESS: 'Cập nhật thành công',
  NOT_PERMISSION: 'Không có thẩm quyền để thực hiện',
  RESQUEST_WRONG: 'Request không đúng',
  WRONG_ACCESS_TOKEN: 'Access token không đúng. Hãy thử lại',
  DELETE_SUCCESS: 'Xóa thành công',
  NOT_FOUND: 'Không tìm thấy tài nguyên',
};

const STATUS = {
  SUCCESS: 200,
  ERROR: 400,
  NOT_AUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
};

module.exports = {
  RESPONSE_MESSAGE: MESSAGE,
  RESPONSE_STATUS: STATUS,
};
