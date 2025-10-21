import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { signupSchema } from '@/lib/schemas/auth.schema';
import type z from 'zod';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import googleIcon from '../../assets/images/google_icon.png';

export type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      institutionalID: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData: SignupFormValues) => {
    try {
      const { data } = await axiosInstance.post('/auth/signup', formData);
      toast.success(data.message);
      navigate('/login');
    } catch (error: any) {
      console.error('Failed to sign up', error);
      toast.error(error.message ?? 'Failed to sign up');
    }
  };

  return (
    <Card className="form-card w-full max-w-sm">
      <CardHeader>
        <CardTitle className="form-title">Create your account</CardTitle>
        <CardDescription className="form-description">
          Fill up the form below to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="signup-form"
          onSubmit={handleSubmit(onSubmit)}
          className="form-fields space-y-4"
        >
          <Controller
            name="institutionalID"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Institutional ID</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your ID here"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="Juan Dela Cruz"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type="email"
                  placeholder="juan@gmail.com"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type="password"
                  placeholder="********"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  type="password"
                  placeholder="********"
                  autoComplete="off"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" form="signup-form" className="form-button-primary w-full">
          Signup
        </Button>
        <Button variant="outline" className="form-button-google w-full">
          <img src={googleIcon} alt="Google" className="form-google-icon" />
          Signup with Google
        </Button>
        <div className="form-alt-action mt-2 text-center text-sm">
          Already have an account?{' '}
          <span
            className="form-link text-purple-500 underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Sign in
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
