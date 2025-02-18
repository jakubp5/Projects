// ConfirmationDialog.tsx
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material'
import React from 'react'

interface ConfirmationDialogProps {
    open: boolean
    onClose: () => void
    onDelete: () => void
    itemName: string
    itemType: 'category' | 'attribute'
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    onClose,
    onDelete,
    itemName,
    itemType,
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete{' '}
                    {itemType === 'category' ? `"${itemName}"` : `"${itemName}"`}? This action
                    cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={onDelete} color="error">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmationDialog
