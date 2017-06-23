#include <pebble.h>
#include "main.h"
const uint32_t inbox_size = 10;
const uint32_t outbox_size = 512;
static Window *window;
static TextLayer *text_layer;
static DictationSession *s_dictation_session;
static char s_last_text[512];

enum {
  ACTION,
  DATA,
  QUIT
};

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  // A message was received, but had to be dropped
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped. Reason: %d", (int)reason);
}
static void deinit(void) {
  dictation_session_destroy(s_dictation_session);
  window_destroy(window);
}

static void inbox_received_callback(DictionaryIterator *iter, void *context) {
 Tuple *action_tuple = dict_find(iter, ACTION);
  if(action_tuple) {
    int32_t action = action_tuple->value->int32;
    if (action == 0){
       window_stack_pop_all(true);
    }
  }
}

 static void pushReminder(char *transcription){
    DictionaryIterator *out_iter;

  // Prepare the outbox buffer for this message
  AppMessageResult result = app_message_outbox_begin(&out_iter);
  if(result == APP_MSG_OK) {
    // Add an item to ask for weather data
      dict_write_int8(out_iter, ACTION, 0);
     dict_write_cstring(out_iter, DATA, transcription);
    // Send this message
    result = app_message_outbox_send();
    if(result != APP_MSG_OK) {
      APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending the outbox: %d", (int)result);
    }
    else
      {
      
    }
  } else {
    // The outbox cannot be used right now
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error preparing the outbox: %d", (int)result);
  }
 }
static void dictation_session_callback(DictationSession *session, DictationSessionStatus status, 
                                       char *transcription, void *context) {
  if(status == DictationSessionStatusSuccess) {
    // Display the dictated text
    pushReminder(transcription);
   
   // text_layer_set_text(text_layer, s_last_text);
  } else {
    // Display the reason for any error
    static char s_failed_buff[128];
    snprintf(s_failed_buff, sizeof(s_failed_buff), "Transcription failed.\n\nError ID:\n%d", (int)status);
    text_layer_set_text(text_layer, s_failed_buff);
  }
}


static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  text_layer = text_layer_create(GRect(0, 72, bounds.size.w, 20));
  text_layer_set_text_alignment(text_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(text_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(text_layer);
}

static void init(void) {
  window = window_create();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
  app_message_open(inbox_size, outbox_size);
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  s_dictation_session = dictation_session_create(sizeof(s_last_text), dictation_session_callback, NULL);
  dictation_session_start(s_dictation_session);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}