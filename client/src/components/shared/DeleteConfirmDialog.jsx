import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title = 'Delete Confirmation',
    description = 'Are you sure you want to delete this item? This action cannot be undone.'
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
                <Button variant="destructive" onClick={onConfirm}>
                    Delete
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
