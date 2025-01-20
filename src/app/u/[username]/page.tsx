"use client";
import React, { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { messageSchema } from "@/schemas/messageSchema";
import axios, { AxiosError } from "axios";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/apiResponse";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucideLoader, SendIcon, Sparkles } from "lucide-react";
import { useCompletion } from "ai/react";
const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

const Public_Page = () => {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { toast } = useToast();

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: "/api/suggestMessages",
    initialCompletion: initialMessageString,
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });
  const messageContent = form.watch("content");
  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };
  const [isLoading, setIsLoading] = useState(false);
  const onSendMessage = async (data: z.infer<typeof messageSchema>) => {
    try {
      setIsLoading(true);
      await axios.post(`/api/sendMessages`, {
        username: username,
        content: data.content,
      });
      toast({
        title: "Message Sent",
        description: "Message Sent Succesfully",
        variant: "default",
      });
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      console.error("Error in signup of user", error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message;
      toast({
        title: "Error While Sending Messages",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const fetchSuggestedMessages = async () => {
    try {
      complete("");
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4 text-center">
        {" "}
        Public Profile Link
      </h1>
      <div className="mb-4 flex flex-row">
        <h2 className="font-semibold ">
          Send Anonumus Message to
          <span className="text-blue-500 italic ml-1 cursor-pointer">
            @{username}
          </span>
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSendMessage)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Message you want to send here"
                    {...field}
                    value={field.value ?? ""}
                    className=" italic"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                Please wait
                <LucideLoader className="mr-2 h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !messageContent}>
                Send It
                <SendIcon />
              </Button>
            )}
          </div>
        </form>
      </Form>
      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isSuggestLoading}
          >
            Suggest Messages with AI <Sparkles />
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col justify-between">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              parseStringMessages(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={"/signUp"}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
};

export default Public_Page;
