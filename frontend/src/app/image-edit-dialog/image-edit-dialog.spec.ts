import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageEditDialog } from './image-edit-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

describe('ImageEditDialog', () => {
    let component: ImageEditDialog;
    let fixture: ComponentFixture<ImageEditDialog>;
    let mockDialogRef: { close: any };
    const mockData = {
        id: 1,
        filePath: 'test.png',
        description: 'Test Desc',
        hashtags: '#test',
        mentions: '@test'
    };

    beforeEach(async () => {
        mockDialogRef = {
            close: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ImageEditDialog, NoopAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockData }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ImageEditDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with data', () => {
        expect(component.editForm.get('description')?.value).toBe('Test Desc');
        expect(component.editForm.get('hashtags')?.value).toBe('#test');
        expect(component.editForm.get('mentions')?.value).toBe('@test');
    });

    it('should format hashtags on blur', () => {
        component.editForm.get('hashtags')?.setValue('test #nature');
        component.onHashtagsBlur();
        expect(component.editForm.get('hashtags')?.value).toBe('#test #nature');
    });

    it('should format mentions on blur', () => {
        component.editForm.get('mentions')?.setValue('user @dev');
        component.onMentionsBlur();
        expect(component.editForm.get('mentions')?.value).toBe('@user @dev');
    });

    it('should close dialog on cancel', () => {
        fixture.debugElement.query(By.css('button[mat-button]')).nativeElement.click();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should close with data on save', () => {
        component.editForm.get('description')?.setValue('New Desc');
        fixture.debugElement.query(By.css('button[mat-raised-button]')).nativeElement.click();

        expect(mockDialogRef.close).toHaveBeenCalledWith({
            description: 'New Desc',
            hashtags: '#test',
            mentions: '@test'
        });
    });
});
