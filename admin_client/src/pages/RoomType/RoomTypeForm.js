import { useEffect, useState } from "react";
// UI lib
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
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
import { PriceFormatCustom } from "../../components/FormattedInput";
import MultipleAsyncAutocomplete from "../../components/AsyncAutocomplete/MultipleAutocomplete";
import SingleAsyncAutocomplete from "../../components/AsyncAutocomplete/SingleAutocomplete";
import ImageUploader from "../../components/ImageUploader";
// logic lib
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { Formik, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
// logic custom
import { createRoomType, updateRoomType } from "../../redux/actions/room_type";
import { getAllHotelForForm } from "../../api/hotel";

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

const RoomTypeForm = ({ open, setOpen, editedId, setEditedId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [files, setFiles] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const roomType = useSelector((state) =>
    editedId ? state.room_type.find((item) => item._id === editedId) : null
  );

  const handleSuccess = (message) => {
    enqueueSnackbar(message, { variant: "success" });
  };

  const handleFailure = (message) => {
    enqueueSnackbar(message, { variant: "error" });
  };

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
        {editedId ? "C???P NH???T LO???I PH??NG" : "TH??M M???I LO???I PH??NG"}
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={
            roomType
              ? {
                  name: roomType.name,
                  hotel: roomType.hotel,
                  rent_bill: roomType.rent_bill,
                  bed_number: roomType.bed_number,
                  big_bed_number: roomType.big_bed_number,
                  size: roomType.size,
                  adult: roomType.adult,
                  kid: roomType.kid,
                  services: roomType.services,
                  images: [],
                  current_images: roomType.images,
                }
              : {
                  name: "",
                  hotel: { name: "", _id: "" },
                  rent_bill: "",
                  bed_number: "",
                  big_bed_number: "",
                  size: "",
                  adult: "",
                  kid: "",
                  services: [],
                  images: [],
                  current_images: [],
                }
          }
          validationSchema={Yup.object().shape({
            name: Yup.string().required("Ch??a nh???p t??n lo???i ph??ng"),
            hotel: Yup.object()
              .nullable()
              .test("hotel", "Ch??a ch???n kh??ch s???n", (val) => val?._id),
            rent_bill: Yup.number().required("Ch??a nh???p gi?? thu?? / 1 ????m"),
            bed_number: Yup.number().required("Ch??a nh???p s??? gi?????ng"),
            big_bed_number: Yup.number().required("Ch??a nh???p s??? gi?????ng l???n"),
            size: Yup.number().required("Ch??a nh???p di???n t??ch ph??ng"),
            adult: Yup.number()
              .min(1, "S??? ng?????i l???n >= 1")
              .required("Ch??a nh???p s??? ng?????i l???n"),
            kid: Yup.number()
              .min(0, "S??? tr??? em >= 0")
              .required("Ch??a nh???p s??? tr??? em"),
            services: Yup.array().min(1, "Ch??a ch???n d???ch v??? ph??ng"),
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
              formData.append("services", values.services[i]._id);
            }
            formData.append("hotel", values.hotel._id);
            for (let key in values) {
              if (
                key !== "images" &&
                key !== "services" &&
                key !== "current_images" &&
                key !== "deleted_images" &&
                key !== "hotel"
              )
                formData.append(key, values[key]);
            }
            if (editedId) {
              dispatch(
                updateRoomType(
                  editedId,
                  formData,
                  () => {
                    handleSuccess("C???p nh???t lo???i ph??ng th??nh c??ng");
                    handleCloseDialog();
                    setSubmitting(false);
                  },
                  (needLogin, message) => {
                    handleFailure(message);
                    setSubmitting(false);
                    if (needLogin) navigate("/login", { replace: true });
                  }
                )
              );
            } else {
              dispatch(
                createRoomType(
                  formData,
                  () => {
                    handleSuccess("Th??m lo???i ph??ng th??nh c??ng");
                    setSubmitting(false);
                    handleCloseDialog();
                  },
                  (needLogin, message) => {
                    handleFailure(message);
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
              {/* NAME - HOTEL */}
              <Grid container columnSpacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    error={Boolean(touched.name && errors.name)}
                    fullWidth
                    helperText={touched.name && errors.name}
                    label="T??n lo???i ph??ng"
                    margin="normal"
                    type="text"
                    name="name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.name}
                    variant="outlined"
                    autoComplete="new-password"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <SingleAsyncAutocomplete
                    touched={touched.hotel}
                    errors={errors.hotel}
                    value={values.hotel}
                    name="hotel"
                    text="Kh??ch s???n"
                    setFieldValue={setFieldValue}
                    fieldToSetValue="hotel"
                    getData={getAllHotelForForm}
                    getOptionLabel={(option) => option.name}
                    noOptionsText="Kh??ng t??m th???y kh??ch s???n"
                  />
                </Grid>
              </Grid>
              {/* SIZE - BED_NUMBER - BIG_BED_NUMBER */}
              <Grid container columnSpacing={3}>
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
                    error={Boolean(touched.bed_number && errors.bed_number)}
                    fullWidth
                    helperText={touched.bed_number && errors.bed_number}
                    label="S??? gi?????ng"
                    margin="normal"
                    type="text"
                    name="bed_number"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.bed_number}
                    variant="outlined"
                    autoComplete="new-password"
                    InputProps={{
                      inputComponent: PriceFormatCustom,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    error={Boolean(
                      touched.big_bed_number && errors.big_bed_number
                    )}
                    fullWidth
                    helperText={touched.big_bed_number && errors.big_bed_number}
                    label="S??? gi?????ng l???n"
                    margin="normal"
                    type="text"
                    name="big_bed_number"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.big_bed_number}
                    variant="outlined"
                    autoComplete="new-password"
                    InputProps={{
                      inputComponent: PriceFormatCustom,
                    }}
                  />
                </Grid>
              </Grid>
              {/* RENT_BILL - ADULT - KID */}
              <Grid container columnSpacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    error={Boolean(touched.rent_bill && errors.rent_bill)}
                    fullWidth
                    helperText={touched.rent_bill && errors.rent_bill}
                    label="Gi?? thu?? / 1 ????m"
                    margin="normal"
                    type="text"
                    name="rent_bill"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.rent_bill}
                    variant="outlined"
                    autoComplete="new-password"
                    InputProps={{
                      inputComponent: PriceFormatCustom,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography>VN??</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    error={Boolean(touched.adult && errors.adult)}
                    fullWidth
                    helperText={touched.adult && errors.adult}
                    label="S??? ng?????i l???n"
                    margin="normal"
                    type="text"
                    name="adult"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.adult}
                    variant="outlined"
                    autoComplete="new-password"
                    InputProps={{
                      inputComponent: PriceFormatCustom,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    error={Boolean(touched.kid && errors.kid)}
                    fullWidth
                    helperText={touched.kid && errors.kid}
                    label="S??? tr??? em"
                    margin="normal"
                    type="text"
                    name="kid"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.kid}
                    variant="outlined"
                    autoComplete="new-password"
                    InputProps={{
                      inputComponent: PriceFormatCustom,
                    }}
                  />
                </Grid>
              </Grid>
              {/* SERVICES */}
              <MultipleAsyncAutocomplete
                touched={touched.services}
                errors={errors.services}
                value={values.services}
                name="service"
                text="D???ch v??? ph??ng"
                setFieldValue={setFieldValue}
                fieldToSetValue="services"
                noOptionsText="Kh??ng t??m th???y d???ch v??? ph??ng"
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress style={{ color: "#252525" }} />
                  ) : editedId ? (
                    "C???P NH???T"
                  ) : (
                    "T???O LO???I PH??NG"
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

export default RoomTypeForm;
