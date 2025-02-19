'use client';
import {
  CreatebleSelect,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
  DialogDescription,
} from '@commonalityco/ui-design-system';
import { formatTagName } from '@commonalityco/utils-core';
import React, { ComponentProps, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { setTagsAction } from '@/actions/metadata';

const formSchema = z.object({
  tags: z.array(z.object({ label: z.string(), value: z.string() })),
});

export function EditTagsDialogContent({
  packageName,
  tags,
  existingTags,
  onEdit,
}: {
  packageName: string;
  tags: string[];
  existingTags: string[];
  onEdit?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tags: existingTags.map((existingTag) => ({
        value: existingTag,
        label: formatTagName(existingTag),
      })),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newTags = values.tags.map((item) => item.value);

    startTransition(async () => {
      await setTagsAction({ packageName, tags: newTags });
      onEdit?.();
    });
  }

  return (
    <>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit tags</DialogTitle>
          <DialogDescription>
            {`We will create or update the`}
            <span className="text-foreground mx-1 font-medium">
              commonality.json
            </span>
            file for{' '}
            <span className="text-foreground font-medium">{packageName}</span>{' '}
            with the tags you select.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="tags"
              render={({ field: { onChange, value, name, ref } }) => (
                <FormItem>
                  <FormControl>
                    <CreatebleSelect
                      isMulti
                      placeholder="Search or create tags..."
                      noOptionsMessage={() =>
                        'Start typing to create a new tag'
                      }
                      formatCreateLabel={(inputValue) => {
                        return `Create ${formatTagName(inputValue)}`;
                      }}
                      value={value}
                      onChange={onChange}
                      name={name}
                      options={tags.map((tag) => ({
                        label: formatTagName(tag),
                        value: tag,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={isPending}>Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </>
  );
}

export function EditTagsDialog({
  children,
  ...rest
}: ComponentProps<typeof Dialog>) {
  return <Dialog {...rest}>{children}</Dialog>;
}
