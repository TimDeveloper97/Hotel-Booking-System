import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { useRef, useState } from "react";
import Iconify from "../../components/Iconify";

const RoomTypeOptionMenu = ({
  id,
  setEditedId,
  setOpenEditDialog,
  setOpenDeleteDialog,
}) => {
  const [open, setOpen] = useState(false);
  const anchor = useRef();
  const handleCloseMenu = () => {
    if (open) setOpen(false);
  };

  const handleEdit = () => {
    setEditedId(id);
    setOpenEditDialog(true);
    setOpen(false);
  };

  const handleDelete = () => {
    setEditedId(id);
    setOpenDeleteDialog(true);
    setOpen(false);
  };
  const handleOpenMenu = () => {
    setOpen(true);
  };
  return (
    <>
      <Tooltip title="Tùy chọn" placement="top">
        <IconButton ref={anchor} onClick={handleOpenMenu}>
          <Iconify icon="bx:dots-vertical-rounded" />
        </IconButton>
      </Tooltip>

      <Menu
        open={open}
        anchorEl={anchor.current}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "center", horizontal: "left" }}
        transformOrigin={{ vertical: "center", horizontal: "right" }}
        PaperProps={{ sx: { width: 150, maxWidth: "100%" } }}
      >
        <MenuItem sx={{ color: "text.secondary" }} onClick={handleEdit}>
          <ListItemIcon>
            <Iconify icon="eva:edit-fill" width={24} height={24} />
          </ListItemIcon>
          <ListItemText
            primary="Sửa"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </MenuItem>
        <MenuItem sx={{ color: "text.secondary" }} onClick={handleDelete}>
          <ListItemIcon>
            <Iconify icon="eva:trash-2-outline" width={24} height={24} />
          </ListItemIcon>
          <ListItemText
            primary="Xóa"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default RoomTypeOptionMenu;
