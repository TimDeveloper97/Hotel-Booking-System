import { useState, useEffect } from "react";
// UI lib
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
// UI custom
import Iconify from "../../components/Iconify";
// logic lib
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
// logic custom
import { changePassword } from "../../api/user";
import { formatDate } from "../../utils/date";
import { getDeviceSpec } from "../../utils/Device";
//#region CSS
const ItemStyle = styled(Box)(({ theme }) => ({
  flex: 1,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 4,
  padding: 15,
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  [theme.breakpoints.down(675)]: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
}));
//#endregion

//----------------------------
const LoadingList = () => {
  return (
    <>
      <Skeleton
        variant="rectangular"
        animation="wave"
        style={{
          width: "100%",
          height: 100,
          marginBottom: 20,
          borderRadius: 4,
        }}
      ></Skeleton>
      <Skeleton
        variant="rectangular"
        animation="wave"
        style={{
          width: "100%",
          height: 100,
          marginBottom: 20,
          borderRadius: 4,
        }}
      ></Skeleton>
    </>
  );
};

const Authentication = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  //creating IP state
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  //creating function to load ip address from the API
  useEffect(() => {
    let isMounted = true;
    const getData = async () => {
      const res = await axios.get("https://geolocation-db.com/json/", {
        withCredentials: false,
      });
      if (isMounted) {
        setInfo(res.data);
        setIsLoading(false);
      }
    };

    getData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box
      style={{
        width: "100%",
      }}
    >
      <Typography variant="h4" style={{ marginBottom: 20 }}>
        ?????i m???t kh???u
      </Typography>
      {/* CHANGE PW */}
      <Box
        style={{
          width: "100%",
          padding: 20,
          borderRadius: 4,
          boxShadow: "0 0 2pt 0pt gray",
        }}
      >
        <Formik
          initialValues={{
            current_password: "",
            new_password: "",
            confirm_new_password: "",
          }}
          validationSchema={Yup.object().shape({
            current_password: Yup.string()
              .min(1, "M???t kh???u d??i t???i thi???u 6 k?? t???")
              .max(100, "M???t kh???u d??i t???i ??a 100 k?? t???")
              .required("Ch??a nh???p m???t kh???u"),
            new_password: Yup.string()
              // .min(6, "M???t kh???u d??i t???i thi???u 6 k?? t???")
              // .max(100, "M???t kh???u d??i t???i ??a 100 k?? t???")
              .required("Ch??a nh???p m???t kh???u"),
            confirm_new_password: Yup.string()
              // .min(6, "M???t kh???u d??i t???i thi???u 6 k?? t???")
              // .max(100, "M???t kh???u d??i t???i ??a 100 k?? t???")
              .oneOf([Yup.ref("new_password"), null], "M???t kh???u kh??ng kh???p")
              .required("Ch??a nh???p m???t kh???u"),
          })}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            changePassword(values)
              .then((res) => {
                enqueueSnackbar("?????i m???t kh???u th??nh c??ng", {
                  variant: "success",
                });
                setSubmitting(false);
                resetForm();
              })
              .catch((err) => {
                enqueueSnackbar(err.response.data, { variant: "error" });
                setSubmitting(false);
                if (err.response.status === 401) {
                  navigate("/login", {
                    state: { returnUrl: "/settings?tab=security" },
                  });
                }
              });
          }}
        >
          {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
            touched,
            values,
          }) => (
            <form onSubmit={handleSubmit}>
              <TextField
                error={Boolean(
                  touched.current_password && errors.current_password
                )}
                fullWidth
                helperText={touched.current_password && errors.current_password}
                label="M???t kh???u"
                margin="normal"
                name="current_password"
                type={showCurrentPassword ? "text" : "password"}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.current_password}
                variant="outlined"
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        edge="end"
                      >
                        <Iconify
                          icon={
                            showCurrentPassword
                              ? "eva:eye-fill"
                              : "eva:eye-off-fill"
                          }
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                error={Boolean(touched.new_password && errors.new_password)}
                fullWidth
                helperText={touched.new_password && errors.new_password}
                label="M???t kh???u m???i"
                margin="normal"
                name="new_password"
                type={showNewPassword ? "text" : "password"}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.new_password}
                variant="outlined"
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        <Iconify
                          icon={
                            showNewPassword
                              ? "eva:eye-fill"
                              : "eva:eye-off-fill"
                          }
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                error={Boolean(
                  touched.confirm_new_password && errors.confirm_new_password
                )}
                fullWidth
                helperText={
                  touched.confirm_new_password && errors.confirm_new_password
                }
                label="X??c nh???n m???t kh???u m???i"
                margin="normal"
                name="confirm_new_password"
                type={showConfirmNewPassword ? "text" : "password"}
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.confirm_new_password}
                variant="outlined"
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmNewPassword(!showConfirmNewPassword)
                        }
                        edge="end"
                      >
                        <Iconify
                          icon={
                            showConfirmNewPassword
                              ? "eva:eye-fill"
                              : "eva:eye-off-fill"
                          }
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                sx={{ marginTop: 2, height: 50 }}
                type="submit"
                variant="contained"
                disabled={isSubmitting ? true : false}
              >
                {isSubmitting ? (
                  <CircularProgress style={{ color: "#252525" }} />
                ) : (
                  "L??U THAY ?????I"
                )}
              </Button>
            </form>
          )}
        </Formik>
      </Box>
      {/* SESSIONS */}
      <Typography variant="h4" style={{ marginTop: 50, marginBottom: 6 }}>
        Phi??n ????ng nh???p
      </Typography>
      <Typography variant="body1" style={{ marginBottom: 20 }}>
        Danh s??ch c??c thi???t b??? ???? ????ng nh???p v??o t??i kho???n c???a b???n
      </Typography>
      {/* ITEM LIST */}
      {isLoading ? (
        <LoadingList />
      ) : (
        <>
          <Stack
            flexDirection="row"
            style={{
              borderRadius: 4,
              boxShadow: "0 0 2pt 0pt gray",
              marginBottom: 20,
            }}
          >
            <Box
              style={{
                width: 100,
                backgroundColor: "#dedede",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
              }}
            >
              <Iconify
                style={{ width: 50, height: 50 }}
                icon="emojione-monotone:desktop-computer"
                // icon="fa:mobile"
              />
            </Box>
            <ItemStyle>
              <Box>
                {/* TYPE */}
                <Box>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    style={{ marginRight: 10 }}
                  >
                    {getDeviceSpec()}
                  </Typography>
                </Box>
                {/* IP - LOCATION */}
                <Typography variant="body1" style={{ marginBottom: 2 }}>
                  T??? {info.IPv4 ? info.IPv4 : "N/A"} -{" "}
                  {info.city ? info.city : "N/A"} -{" "}
                  {info.country_name ? info.country_name : "N/A"}
                </Typography>
                <Typography variant="body1" style={{ marginRight: 2 }}>
                  {formatDate(Date.now())}
                </Typography>
              </Box>
              {/* REVOKE */}
              <Button
                variant="contained"
                color="success"
                style={{ height: 35, color: "#FFF" }}
              >
                ??ang ho???t ?????ng
              </Button>
            </ItemStyle>
          </Stack>
          {/* ----- */}
        </>
      )}
    </Box>
  );
};

export default Authentication;
