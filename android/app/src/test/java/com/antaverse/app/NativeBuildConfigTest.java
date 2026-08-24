package com.antaverse.app;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class NativeBuildConfigTest {

    @Test
    public void applicationIdIsStable() {
        assertEquals("com.antaverse.app", BuildConfig.APPLICATION_ID);
    }
}
