const { hash, executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getUserById = async (id, callBack) => {
  let sql = `
    SELECT
      u.*,
      u.password AS hashedPassword, 
      r.id,
      r.name AS role_name,
      rest.name AS restaurant_name
    FROM
      users u
    LEFT JOIN
      roles r ON r.id = u.role_id
    LEFT JOIN
      restaurant rest ON rest.id = u.restaurant_id
    WHERE
      id = ${id}
  `;

  executeQuery(sql, "getUserById", (result) => {
    if (Array.isArray(result) && !result[0]) {
      return callBack(new CustomError(result[1], 400));
    }

    if (result && result.length > 0) {
      return callBack(result[0]);
    }

    return callBack(new CustomError("User not found.", 404));
  });
};

const registerUser = async (user, callBack) => {
  const { name, username, email, phone, password, role_id, restaurant_id } = user;
  const passwordHash = await hash(password);

  let sql = `
    INSERT INTO
      users (
        name,
        username,
        email,
        phone,
        password,
        role_id
      )
    VALUES (
      "${name}",
      "${username}",
      "${email}",
      "${phone}",
      "${passwordHash}",
      ${role_id},
      ${restaurant_id}
    )
  `;

  executeQuery(sql, "registerUser", (result) => {
    if (Array.isArray(result) && !result[0]) {
      return callBack(new CustomError(result[1], 400));
    }

    if (result && result?.insertId) {
      return callBack({
        status: true,
        message: "Registered Successfully!",
      });
    }

    return callBack(new CustomError("An unknown error occurred during registration.", 500));
  });
};

module.exports = {
  getUserByIdModel: getUserById,
  registerUserModel: registerUser,
};
