import { useEffect, useState } from "react";
// UI lib
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
// UI custom
import Iconify from "../../components/Iconify";
import SlideTransition from "../../components/SlideTransition";
import {
  TelephoneFormatCustom,
  PriceFormatCustom,
} from "../../components/FormattedInput";
import ImageUploader from "../../components/ImageUploader";
// logic lib
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { Formik, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
// logic custom
import { createHotel } from "../../redux/actions/hotel";
import { city, HOTEL_SERVICES } from "../../__MOCK__";
import { updateHotel } from "../../redux/actions/hotel";

//#region CSS
const ImagePreview = styled(Box)({
  marginTop: 20,
  marginBottom: 10,
});

const DeleteImageButton = styled(IconButton)({
  width: 30,
  height: 30,
  position: "absolute",
  borderRadius: 15,
  top: 5,
  right: 5,
  backgroundColor: "rgba(255,255,255,.5)",
  transition: "background-color .3s ease",
  "&:hover": {
    backgroundColor: "#FFF",
  },
});
//#endregion

//----------------------------

const HotelForm = ({ open, setOpen, editedId, setEditedId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [files, setFiles] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const hotel = useSelector((state) =>
    editedId ? state.hotel.find((item) => item._id === editedId) : null
  );
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const handleCloseDialog = () => {
    if (editedId) setEditedId();
    setFiles([]);
    setDeletedImages([]);
    setOpen(false);
  };

  const showNotification = (message, type) => {
    enqueueSnackbar(message, { variant: type });
  };
  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      aria-labelledby="form-dialog-title"
      TransitionComponent={SlideTransition}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle id="form-dialog-title">
        {editedId ? "C???P NH???T KH??CH S???N" : "TH??M M???I KH??CH S???N"}
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={
            hotel
              ? {
                  name: hotel.name,
                  address: hotel.address,
                  phone: hotel.phone,
                  email: hotel.email,
                  size: hotel.size,
                  numberOfRooms: hotel.numberOfRooms,
                  fake: hotel.city,
                  description: hotel.description,
                  services: hotel.services.map(
                    (service) => HOTEL_SERVICES[service]
                  ),
                  images: [],
                  current_images: hotel.images,
                }
              : {
                  name: "",
                  address: "",
                  phone: "",
                  email: "",
                  size: "",
                  numberOfRooms: "",
                  fake: 0,
                  description: "",
                  services: [],
                  images: [],
                  current_images: [],
                }
          }
          validationSchema={Yup.object().shape({
            name: Yup.string().required("Ch??a nh???p t??n kh??ch s???n"),
            address: Yup.string().required("Ch??a nh???p ?????a ch???"),
            phone: Yup.string()
              .required("Ch??a nh???p s??? ??i???n tho???i")
              .min(11, "S??? ??i???n tho???i kh??ng h???p l???")
              .max(11, "S??? ??i???n tho???i kh??ng h???p l???"),
            email: Yup.string().required("Ch??a nh???p email"),
            size: Yup.number().required("Ch??a nh???p di???n t??ch"),
            numberOfRooms: Yup.number().required("Ch??a nh???p s??? ph??ng"),
            fake: Yup.number()
              .min(1, "Ch???n t???nh / th??nh ph???")
              .max(63, "Ch???n t???nh / th??nh ph???"),
            description: Yup.string().required("Ch??a nh???p m?? t???"),
            services: Yup.array().min(1, "Ch??a ch???n d???ch v???"),
            images: Yup.array().test(
              "images_required", // test name
              "Nh???p ????? ??t nh???t 4 ???nh", // error message
              function (item) {
                //item is the current field (images in this case)
                return item.length + this.parent.current_images.length >= 4;
              }
            ),
            current_images: Yup.array().test(
              "current_images_required",
              "Nh???p ????? ??t nh???t 4 ???nh",
              function (item) {
                return item.length + this.parent.images.length >= 4;
              }
            ),
          })}
          onSubmit={(values, { setSubmitting }) => {
            let formData = new FormData();
            for (let i = 0; i < values.images.length; i++) {
              formData.append("images", values.images[i]);
            }
            for (let i = 0; i < values.current_images.length; i++) {
              formData.append("current_images", values.current_images[i]);
            }
            deletedImages.forEach((item) => {
              formData.append("deleted_images", item);
            });
            for (let i = 0; i < values.services.length; i++) {
              formData.append("services", values.services[i].id);
            }
            for (let key in values) {
              if (
                key !== "images" &&
                key !== "services" &&
                key !== "current_images" &&
                key !== "deleted_images"
              )
                formData.append(key, values[key]);
            }
            if (editedId) {
              dispatch(
                updateHotel(
                  editedId,
                  formData,
                  () => {
                    showNotification(
                      "C???p nh???t kh??ch s???n th??nh c??ng",
                      "success"
                    );
                    handleCloseDialog();
                    setSubmitting(false);
                  },
                  (needLogin, message) => {
                    showNotification(message, "error");
                    setSubmitting(false);
                    if (needLogin) navigate("/login", { replace: true });
                  }
                )
              );
            } else {
              dispatch(
                createHotel(
                  formData,
                  () => {
                    showNotification("Th??m kh??ch s???n th??nh c??ng", "success");
                    setSubmitting(false);
                    handleCloseDialog();
                  },
                  (needLogin, message) => {
                    showNotification(message, "error");
                    setSubmitting(false);
                    if (needLogin) navigate("/login", { replace: true });
                  }
                )
              );
            }
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
            setFieldValue,
          }) => (
            <form onSubmit={handleSubmit}>
              {/* NAME */}
              <TextField
                error={Boolean(touched.name && errors.name)}
                fullWidth
                helperText={touched.name && errors.name}
                label="T??n kh??ch s???n"
                margin="normal"
                type="text"
                name="name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                variant="outlined"
                autoComplete="new-password"
              />
              {/* ADDRESS */}
              <TextField
                error={Boolean(touched.address && errors.address)}
                fullWidth
                helperText={touched.address && errors.address}
                label="?????a ch???"
                margin="normal"
                type="text"
                name="address"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address}
                variant="outlined"
                autoComplete="new-password"
              />
              {/* SIZE - NUM ROOMS - CITY */}
              <Grid container columnSpacing={3}>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    id="fake"
                    name="fake"
                    value={city[values.fake]}
                    getOptionLabel={(option) => option.name}
                    onChange={(e, value) => {
                      setFieldValue("fake", value !== null ? value.fake : 0);
                    }}
                    options={city}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={Boolean(touched.fake && errors.fake)}
                        helperText={touched.fake && errors.fake}
                        name="fake"
                        margin="normal"
                        label="T???nh / Th??nh ph???"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    error={Boolean(touched.size && errors.size)}
                    fullWidth
                    helperText={touched.size && errors.size}
                    label="Di???n t??ch"
                    margin="normal"
                    type="text"
                    name="size"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.size}
                    variant="outlined"
                    autoComplete="new-password"
                    InputProps={{
                      inputComponent: PriceFormatCustom,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography>
                            m<sup>2</sup>
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    error={Boolean(
                      touched.numberOfRooms && errors.numberOfRooms
                    )}
                    fullWidth
                    helperText={touched.numberOfRooms && errors.numberOfRooms}
                    label="S??? ph??ng"
                    margin="normal"
                    type="text"
                    name="numberOfRooms"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.numberOfRooms}
                    variant="outlined"
                    autoComplete="new-password"
                    InputProps={{
                      inputComponent: PriceFormatCustom,
                    }}
                  />
                </Grid>
              </Grid>
              {/* PHONE - EMAIL */}
              <Grid container columnSpacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    error={Boolean(touched.phone && errors.phone)}
                    fullWidth
                    helperText={touched.phone && errors.phone}
                    label="S??? ??i???n tho???i"
                    margin="normal"
                    type="text"
                    name="phone"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.phone}
                    variant="outlined"
                    autoComplete="new-password"
                    InputProps={{
                      inputComponent: TelephoneFormatCustom,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    error={Boolean(touched.email && errors.email)}
                    fullWidth
                    helperText={touched.email && errors.email}
                    label="Email"
                    margin="normal"
                    type="text"
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    variant="outlined"
                    autoComplete="new-password"
                  />
                </Grid>
              </Grid>
              {/* DESCRIPTION */}
              <TextField
                error={Boolean(touched.description && errors.description)}
                fullWidth
                helperText={touched.description && errors.description}
                label="M?? t???"
                multiline
                minRows={4}
                maxRows={Infinity}
                margin="normal"
                type="text"
                name="description"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.description}
                variant="outlined"
                autoComplete="new-password"
              />
              {/* SERVICES */}
              <Autocomplete
                multiple
                name="services"
                id="checkboxes-tags-demo"
                options={HOTEL_SERVICES}
                value={values.services}
                disableCloseOnSelect
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option, { selected }) => (
                  <Box {...props}>
                    <Checkbox style={{ marginRight: 8 }} checked={selected} />
                    {option.name}
                  </Box>
                )}
                onChange={(e, value) => {
                  setFieldValue("services", value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(touched.services && errors.services)}
                    helperText={touched.services && errors.services}
                    margin="normal"
                    label="D???ch v???"
                    placeholder="D???ch v???"
                  />
                )}
              />
              {/* IMAGES */}
              <Typography color="#637381" marginTop={3} fontWeight="bold">
                ???nh m?? t???
              </Typography>
              <ImageUploader
                files={files}
                setFiles={setFiles}
                setFieldValue={setFieldValue}
                hasError={
                  (errors.images && touched.images) ||
                  (errors.current_images && touched.current_images)
                }
              />
              {/* IMAGE ERROR MESSAGE */}
              {errors.images ? (
                <ErrorMessage name="images">
                  {(msg) => (
                    <Typography
                      variant="body2"
                      marginLeft={1.5}
                      marginTop={0.5}
                      color="error"
                    >
                      {msg}
                    </Typography>
                  )}
                </ErrorMessage>
              ) : (
                errors.current_images && (
                  <ErrorMessage name="current_images">
                    {(msg) => (
                      <Typography
                        variant="body2"
                        marginLeft={1.5}
                        marginTop={0.5}
                        color="error"
                      >
                        {msg}
                      </Typography>
                    )}
                  </ErrorMessage>
                )
              )}
              {/* CURRENT IMAGES */}
              {editedId && values.current_images.length > 0 && (
                <ImagePreview>
                  <Typography variant="body1">???nh hi???n t???i</Typography>
                  <Grid container rowSpacing={1} columnSpacing={2}>
                    {values.current_images.map((item, index) => (
                      <Grid key={index} item lg={1.5}>
                        <Box
                          style={{
                            width: "100%",
                            height: 90,
                            borderRadius: 8,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <DeleteImageButton
                            onClick={() => {
                              setFieldValue(
                                "current_images",
                                values.current_images.filter(
                                  (image) => image !== item
                                )
                              );
                              setDeletedImages([...deletedImages, item]);
                            }}
                          >
                            <Iconify icon="akar-icons:minus" />
                          </DeleteImageButton>
                          <img
                            src={item}
                            alt="preview"
                            style={{
                              width: "100%",
                              height: 90,
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Stack
                    flexDirection="row"
                    justifyContent="flex-end"
                    marginTop={2}
                  >
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        setDeletedImages([
                          ...values.current_images,
                          ...deletedImages,
                        ]);
                        setFieldValue("current_images", []);
                      }}
                    >
                      X??A H???T
                    </Button>
                  </Stack>
                </ImagePreview>
              )}
              {/* NEW IMAGES */}
              {files.length > 0 && (
                <ImagePreview>
                  {editedId && (
                    <Typography variant="body1">Th??m ???nh</Typography>
                  )}
                  <Grid container rowSpacing={1} columnSpacing={2}>
                    {files.map((item, index) => (
                      <Grid key={index} item lg={1.5}>
                        <Box
                          style={{
                            width: "100%",
                            height: 90,
                            borderRadius: 8,
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <DeleteImageButton
                            onClick={() => {
                              setFiles(
                                files.filter(
                                  (image) => image.path !== item.path
                                )
                              );
                              setFieldValue(
                                "images",
                                values.images.filter(
                                  (image) => image.path !== item.path
                                )
                              );
                            }}
                          >
                            <Iconify icon="akar-icons:minus" />
                          </DeleteImageButton>
                          <img
                            src={item.preview}
                            alt="preview"
                            style={{
                              width: "100%",
                              height: 90,
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Stack
                    flexDirection="row"
                    justifyContent="flex-end"
                    marginTop={2}
                  >
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        setFiles([]);
                        setFieldValue("images", []);
                      }}
                    >
                      X??A H???T
                    </Button>
                  </Stack>
                </ImagePreview>
              )}
              {/* SUBMIT BUTTON */}
              <Stack
                flexDirection="row"
                justifyContent="flex-end"
                marginTop={3}
              >
                <Button variant="outlined" onClick={handleCloseDialog}>
                  H???Y
                </Button>
                <Button
                  sx={{ marginLeft: 2 }}
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting ? true : false}
                >
                  {isSubmitting ? (
                    <CircularProgress style={{ color: "#252525" }} />
                  ) : editedId ? (
                    "C???P NH???T"
                  ) : (
                    "T???O KH??CH S???N"
                  )}
                </Button>
              </Stack>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default HotelForm;
