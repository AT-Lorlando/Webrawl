<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center space-x-3 mb-6">
          <div class="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Icon name="lucide:music" class="w-7 h-7 text-white" />
          </div>
          <h1 class="text-3xl font-bold text-white">Webrawl Music</h1>
        </div>
        <p class="text-slate-300">Créez votre compte pour commencer</p>
      </div>

      <!-- Signup Form -->
      <Card class="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardHeader>
          <h2 class="text-2xl font-semibold text-center text-white">
            Créer un compte
          </h2>
        </CardHeader>
        <CardContent>
          <form
            class="space-y-6"
            @submit.prevent="onSubmit"
          >
            <!-- Champ Nom -->
            <FormField
              v-slot="{ field }"
              name="name"
              :validate-on-blur="true"
            >
              <FormItem>
                <FormLabel class="text-white">Nom complet</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Votre nom complet"
                    v-bind="field"
                    class="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Champ Email -->
            <FormField
              v-slot="{ field }"
              name="email"
              :validate-on-blur="true"
            >
              <FormItem>
                <FormLabel class="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    v-bind="field"
                    class="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Champ Mot de passe -->
            <FormField
              v-slot="{ field }"
              name="password"
              :validate-on-blur="true"
            >
              <FormItem>
                <FormLabel class="text-white">Mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Votre mot de passe"
                    v-bind="field"
                    class="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Champ Confirmation de mot de passe -->
            <FormField
              v-slot="{ field }"
              name="confirmPassword"
              :validate-on-blur="true"
            >
              <FormItem>
                <FormLabel class="text-white">Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirmez votre mot de passe"
                    v-bind="field"
                    class="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Bouton de soumission -->
            <Button
              type="submit"
              :disabled="isSubmitting"
              class="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0"
              size="lg"
            >
              <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
              <Icon v-else name="lucide:user-plus" class="w-4 h-4 mr-2" />
              {{ isSubmitting ? 'Création...' : "S'inscrire" }}
            </Button>

            <!-- Redirection vers la connexion -->
            <div class="text-center">
              <p class="text-slate-300 text-sm">
                Vous avez déjà un compte ?
                <RouterLink
                  to="/login"
                  class="text-cyan-300 hover:text-cyan-200 hover:underline font-medium"
                >
                  Connectez-vous
                </RouterLink>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Back to Home -->
      <div class="text-center mt-8">
        <Button variant="ghost" class="text-slate-400 hover:text-white" @click="navigateTo('/')">
          <Icon name="lucide:arrow-left" class="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>

      <!-- Features Preview -->
      <div class="mt-12 grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="w-10 h-10 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Icon name="lucide:users" class="w-5 h-5 text-emerald-300" />
          </div>
          <p class="text-xs text-slate-400">Multijoueur</p>
        </div>
        <div class="text-center">
          <div class="w-10 h-10 bg-gradient-to-r from-sky-400/20 to-cyan-400/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Icon name="lucide:piano" class="w-5 h-5 text-sky-300" />
          </div>
          <p class="text-xs text-slate-400">Instruments</p>
        </div>
        <div class="text-center">
          <div class="w-10 h-10 bg-gradient-to-r from-lime-400/20 to-green-400/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Icon name="lucide:zap" class="w-5 h-5 text-lime-300" />
          </div>
          <p class="text-xs text-slate-400">Temps réel</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import * as z from 'zod';
import { useRouter, RouterLink } from 'vue-router';
import type { AxiosInstance, AxiosResponse } from 'axios';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';

interface SignupResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token: {
    type: string;
    value: string;
    expiresAt?: string | null;
  };
}

const { $axios } = useNuxtApp();
const axiosInstance = $axios as AxiosInstance;
const router = useRouter();

const formSchema = toTypedSchema(
  z
    .object({
      name: z
        .string()
        .min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
      email: z.string().email({ message: 'L\'email n\'est pas valide' }),
      password: z
        .string()
        .min(6, {
          message: 'Le mot de passe doit contenir au moins 6 caractères',
        }),
      confirmPassword: z
        .string()
        .min(1, { message: 'Le mot de passe doit être confirmé.' }),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: 'Les mots de passe doivent correspondre',
      path: ['confirmPassword'],
    }),
);

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const payload = {
      fullName: values.name,
      email: values.email,
      password: values.password,
    };
    const response: AxiosResponse<SignupResponse> = await axiosInstance.post(
      '/auth/signup',
      payload,
    );
    if (response.status !== 201) {
      throw new Error('Erreur lors de l\'inscription');
    }
    
    toast.success('Inscription réussie !', {
      description: 'Vous pouvez maintenant vous connecter.'
    });
    
    // Redirect to login page
    await navigateTo('/login');
  }
  catch (error: unknown) {
    console.error('Erreur lors de l\'inscription :', error);
    const errorMessage
      = error instanceof Error
        ? error.message
        : 'Une erreur est survenue.';
    
    toast.error('Erreur lors de l\'inscription', {
      description: errorMessage,
    });
  }
});
</script>
