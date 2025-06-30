<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Host Game Card -->
        <Card class="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
        <CardContent class="p-8">
            <div class="text-center space-y-6">
            <div class="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto">
                <Icon name="lucide:plus" class="w-8 h-8 text-white" />
            </div>
            
            <div>
                <h3 class="text-2xl font-bold text-white mb-2">Créer une Partie</h3>
                <p class="text-slate-300">
                Lancez une nouvelle session et invitez vos amis à vous rejoindre avec un code de partie.
                </p>
            </div>

            <div class="space-y-4">
                <div class="flex items-center justify-center space-x-2 text-slate-300">
                <Icon name="lucide:users" class="w-4 h-4" />
                <span class="text-sm">Jusqu'à 4 joueurs</span>
                </div>
                
                <Button 
                size="lg" 
                class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                @click="hostGame"
                :disabled="props.isConnecting"
                >
                <Icon name="lucide:play" class="w-5 h-5 mr-2" />
                {{ props.isConnecting ? 'Création...' : 'Créer une Partie' }}
                </Button>
            </div>
            </div>
        </CardContent>
        </Card>

        <!-- Join Game Card -->
        <Card class="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
        <CardContent class="p-8">
            <div class="text-center space-y-6">
            <div class="w-16 h-16 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto">
                <Icon name="lucide:users" class="w-8 h-8 text-white" />
            </div>
            
            <div>
                <h3 class="text-2xl font-bold text-white mb-2">Rejoindre une Partie</h3>
                <p class="text-slate-300">
                Entrez le code de partie d'un ami pour rejoindre sa session musicale.
                </p>
            </div>

            <div class="space-y-4">
                <Input
                v-model="props.joinCode"
                placeholder="Code de partie (ex: ABC123)"
                class="bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-center text-lg font-mono tracking-wider"
                @input="formatJoinCode"
                maxlength="6"
                />
                
                <Button 
                size="lg" 
                class="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
                @click="joinGame"
                :disabled="!props.joinCode || props.joinCode.length < 6 || props.isConnecting"
                >
                <Icon name="lucide:log-in" class="w-5 h-5 mr-2" />
                {{ isConnecting ? 'Connexion...' : 'Rejoindre' }}
                </Button>
            </div>
            </div>
        </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    isConnecting: boolean;
    gameCode: string;
    joinCode: string;
    playerCount: number;
}>();

const emit = defineEmits<{
    (e: 'hostGame'): void;
    (e: 'joinGame'): void;
    (e: 'formatJoinCode'): void;
}>();

const hostGame = () => {
    emit('hostGame');
};

const joinGame = () => {
    emit('joinGame');
};

const formatJoinCode = () => {
    emit('formatJoinCode');
};


</script>