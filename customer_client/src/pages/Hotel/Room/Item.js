import { useState, useEffect } from "react";
// UI lib
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  styled,
  Tooltip,
  Typography,
  Collapse,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
// UI custom
import Iconify from "../../../components/Iconify";

// logic lib
// logic custom
import { formatNumber } from "../../../utils/Number";

//#region CSS
const RootStyle = styled(Box)(({ theme }) => ({
  padding: 10,
  borderRadius: 4,
  marginBottom: 30,
  display: "flex",
  flexDirection: "row",
  boxShadow: "0 0 3pt 0 gray",
  [theme.breakpoints.down(759)]: {
    flexDirection: "column",
  },
}));

const ImageSection = styled(Box)(({ theme }) => ({
  width: "40%",
  marginRight: 20,
  position: "relative",
  [theme.breakpoints.down(759)]: {
    width: "100%",
    height: 250,
  },
}));

const InfoSection = styled(Box)(({ theme }) => ({
  width: "60%",
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.down(759)]: {
    marginTop: 15,
    width: "100%",
  },
}));

const InfoButton = styled(Typography)(({ theme }) => ({
  cursor: "pointer",
  color: theme.palette.primary.main,
  width: "fit-content",
  userSelect: "none",
  "&:hover": {
    textDecoration: "underline",
  },
}));
//#endregion

//----------------------------
const Item = ({
  comboList,
  setOpenViewer,
  setDataViewer,
  roomType,
  selectedRooms,
  setSelectedRooms,
  selectedComboList,
  setSelectedComboList,
}) => {
  const [selectedCombo, setSelectedCombo] = useState(0);
  const [openCollapse, setOpenCollapse] = useState(false);
  const [amount, setAmount] = useState(
    roomType.rent_bill + comboList[0].amount
  );

  const handleChange = (event) => {
    setSelectedCombo(event.target.value);
  };

  const handleSelectRoom = () => {
    setSelectedRooms([
      ...selectedRooms,
      { _id: roomType._id, name: roomType.name, rent_bill: amount },
    ]);
    setSelectedComboList([...selectedComboList, comboList[selectedCombo]._id]);
    setOpenCollapse(true);
  };

  useEffect(() => {
    setAmount(roomType.rent_bill + comboList[selectedCombo].amount);
  }, [selectedCombo, comboList, roomType.rent_bill]);

  const handleOpenViewer = () => {
    setDataViewer(roomType);
    setOpenViewer(true);
  };

  const handleToggleCollapse = () => {
    setOpenCollapse(!openCollapse);
  };
  return (
    <RootStyle>
      <ImageSection>
        <img
          src={roomType.images[0]}
          style={{
            objectFit: "cover",
            borderRadius: 4,
            height: "100%",
            width: "100%",
          }}
          alt="banner"
        />
      </ImageSection>
      <InfoSection>
        <Typography variant="h4">{roomType.name}</Typography>
        <Stack
          sx={{ width: "100%", my: 0.5 }}
          alignItems="center"
          flexDirection="row"
        >
          <Iconify
            icon="bi:crop"
            style={{ marginRight: 10, width: 20, height: 20 }}
          />
          <Typography variant="body1">
            {formatNumber(roomType.size)} m??
          </Typography>
          <Divider
            orientation="vertical"
            style={{
              height: 15,
              width: 2,
              backgroundColor: "#252525",
              marginLeft: 10,
              marginRight: 10,
            }}
          />
          <Iconify
            style={{ marginRight: 15, width: 20, height: 20 }}
            icon="bi:people"
          />
          <Typography variant="body1" style={{ marginRight: 10 }}>
            {roomType.adult} ng?????i l???n - {roomType.kid} tr??? em
          </Typography>
        </Stack>
        <Typography variant="body1" mb={0.5}>
          Gi?? thu??: {formatNumber(roomType.rent_bill)}??/????m
        </Typography>
        {/* <Typography variant="body1" mb={0.5}>
          (
          {formatNumber(
            Math.floor(roomType.rent_bill + roomType.rent_bill * (20 / 100))
          )}{" "}
          ng??y cao ??i???m)
        </Typography> */}
        <InfoButton variant="body1" onClick={handleOpenViewer}>
          Chi ti???t ph??ng
        </InfoButton>
        <InfoButton variant="body1" onClick={handleToggleCollapse}>
          Danh s??ch g??i
        </InfoButton>
        <Collapse in={openCollapse} timeout="auto" unmountOnExit>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={selectedCombo}
              onChange={handleChange}
            >
              {comboList.map((item, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={
                    <Stack flexDirection="row" alignItems="center">
                      <Iconify
                        icon="emojione:wrapped-gift"
                        style={{ width: 25, height: 25, marginRight: 3 }}
                      />
                      <Typography mr={1}>
                        <span style={{ fontWeight: "bold" }}>
                          {formatNumber(item.name)}
                        </span>{" "}
                        {item.amount > 0 && (
                          <>
                            -{" "}
                            <span style={{ fontWeight: "bold" }}>
                              {formatNumber(item.amount)}??
                            </span>
                            /????m
                          </>
                        )}
                      </Typography>
                      <Tooltip title={item.detail} arrow>
                        <IconButton size="small">
                          <HelpOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Collapse>
        <Stack
          flexDirection="column"
          alignItems="flex-end"
          justifyContent="flex-end"
          style={{ flexGrow: 1 }}
        >
          <Stack
            flexDirection="row"
            alignItems="center"
            style={{ marginBottom: 10 }}
          >
            <Typography variant="body2">T???ng</Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: "primary.main", px: 1 }}
            >
              {formatNumber(amount)} ??
            </Typography>
            <Typography variant="body2">/ ????m</Typography>
          </Stack>
          <Button variant="contained" onClick={handleSelectRoom}>
            ?????T PH??NG
          </Button>
        </Stack>
      </InfoSection>
    </RootStyle>
  );
};

export default Item;
