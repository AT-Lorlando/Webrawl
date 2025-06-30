<template>
    <div>
        <Card class="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 class="text-white font-semibold mb-3 flex items-center">
                  <Icon name="lucide:gamepad-2" class="w-5 h-5 mr-2" />
                  Comment jouer
                </h4>
                <ul class="text-slate-300 text-sm space-y-2">
                  <li>• Utilisez <kbd class="px-2 py-1 bg-white/20 rounded text-xs">WASD</kbd> pour vous déplacer</li>
                  <li>• Appuyez sur <kbd class="px-2 py-1 bg-white/20 rounded text-xs">Shift</kbd> près d'un instrument pour l'utiliser</li>
                  <li>• Utilisez <kbd class="px-2 py-1 bg-white/20 rounded text-xs">Q-P</kbd> pour jouer des notes</li>
                </ul>
              </div>
              <div>
                <h4 class="text-white font-semibold mb-3 flex items-center">
                  <Icon name="lucide:info" class="w-5 h-5 mr-2" />
                  Conseils
                </h4>
                <ul class="text-slate-300 text-sm space-y-2">
                  <li>• Partagez votre code de partie avec vos amis</li>
                  <li>• Ajustez le volume avec le curseur dans le jeu</li>
                  <li>• Explorez l'espace 3D avec votre souris</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
</template>

<script setup lang="ts">
</script>