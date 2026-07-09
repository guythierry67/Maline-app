import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes. Ajoutez-les dans .env (local) ou dans les variables d'environnement Netlify."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLE = "app_storage";

/** Récupère la valeur JSON stockée sous une clé. Retourne null si absente. */
export async function getData(key) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data ? data.value : null;
}

/** Enregistre (upsert) une valeur JSON sous une clé. */
export async function setData(key, value) {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

/**
 * S'abonne aux changements en temps réel sur une clé donnée.
 * callback(value) est appelé à chaque fois qu'un autre appareil modifie la donnée.
 * Retourne une fonction "unsubscribe" à appeler dans le cleanup du useEffect.
 */
export function subscribeToChanges(key, callback) {
  const channel = supabase
    .channel(`app_storage_${key}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE, filter: `key=eq.${key}` },
      (payload) => {
        if (payload.new && payload.new.value) callback(payload.new.value);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
